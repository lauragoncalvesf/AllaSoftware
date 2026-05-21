import prisma from "../config/prisma.js"

const inicioDoMesAtual = () => {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0)
}

const fimDoMesAtual = () => {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999)
}

const parsePeriodo = (query = {}) => {
  const { dataInicio, dataFim } = query

  const inicio = dataInicio ? new Date(dataInicio) : inicioDoMesAtual()
  const fim = dataFim ? new Date(dataFim) : fimDoMesAtual()

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
    const erro = new Error("Periodo invalido")
    erro.statusCode = 400
    throw erro
  }

  if (dataInicio) inicio.setHours(0, 0, 0, 0)
  if (dataFim) fim.setHours(23, 59, 59, 999)

  if (inicio > fim) {
    const erro = new Error("Data inicial nao pode ser maior que a data final")
    erro.statusCode = 400
    throw erro
  }

  return { inicio, fim }
}

const aplicarComissao = (valor, percentual) => {
  const v = Number(valor || 0)
  const p = Number(percentual || 0)
  return (v * p) / 100
}

const resolverPercentualServico = (servicoComissao, percPadrao) => {
  if (servicoComissao !== null && servicoComissao !== undefined) {
    return Number(servicoComissao)
  }
  return Number(percPadrao || 0)
}

const resolverPercentualProduto = (produtoComissao, percPadrao) => {
  if (produtoComissao !== null && produtoComissao !== undefined) {
    return Number(produtoComissao)
  }
  return Number(percPadrao || 0)
}

const calcularComissaoDoUsuario = async ({ empresaId, usuario, inicio, fim }) => {
  const percPadrao = Number(usuario.comissaoPercentualPadrao ?? 0)

  // 1) Serviços — agendamentos concluídos do profissional
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      empresaId,
      profissionalId: usuario.id,
      status: "concluido",
      concluidoEm: {
        gte: inicio,
        lte: fim
      }
    },
    include: {
      servico: true,
      cliente: { select: { id: true, nome: true } }
    },
    orderBy: { concluidoEm: "desc" }
  })

  // 2) Vendas onde o usuário é vendedor
  const vendas = await prisma.venda.findMany({
    where: {
      empresaId,
      vendedorId: usuario.id,
      createdAt: { gte: inicio, lte: fim }
    },
    include: {
      itens: true,
      cliente: { select: { id: true, nome: true } },
      agendamento: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  // Coletar IDs de produtos/serviços usados nas vendas para buscar % específicas
  const produtoIds = new Set()
  const servicoIds = new Set()

  for (const v of vendas) {
    for (const it of v.itens) {
      if (it.tipoItem === "produto") produtoIds.add(Number(it.referenciaId))
      if (it.tipoItem === "servico") servicoIds.add(Number(it.referenciaId))
    }
  }

  const produtos = produtoIds.size
    ? await prisma.produto.findMany({
        where: { id: { in: [...produtoIds] }, empresaId },
        select: { id: true, nome: true, comissaoPercentual: true }
      })
    : []

  const servicos = servicoIds.size
    ? await prisma.servico.findMany({
        where: { id: { in: [...servicoIds] }, empresaId },
        select: { id: true, nome: true, comissaoPercentual: true }
      })
    : []

  const produtoMap = new Map(produtos.map((p) => [p.id, p]))
  const servicoMap = new Map(servicos.map((s) => [s.id, s]))

  const itensComissao = []
  let totalServicos = 0
  let totalProdutos = 0
  let comissaoServicos = 0
  let comissaoProdutos = 0

  // 1) Serviços via agendamentos concluídos
  for (const ag of agendamentos) {
    const valor = Number(ag.valorServico ?? ag.servico?.preco ?? 0)
    const percServico = ag.servico?.comissaoPercentual
    const perc = resolverPercentualServico(percServico, percPadrao)
    const comissao = aplicarComissao(valor, perc)

    totalServicos += valor
    comissaoServicos += comissao

    itensComissao.push({
      origem: "agendamento",
      tipo: "servico",
      agendamentoId: ag.id,
      vendaId: ag.vendaId || null,
      data: ag.concluidoEm,
      descricao: ag.servico?.nome || ag.titulo || "Serviço",
      cliente: ag.cliente?.nome || null,
      valor,
      percentual: perc,
      comissao
    })
  }

  // 2) Itens de venda
  for (const v of vendas) {
    const temAgendamento = Boolean(v.agendamento?.id)

    for (const it of v.itens) {
      const subtotal = Number(it.subtotal || 0)

      if (it.tipoItem === "produto") {
        const produto = produtoMap.get(Number(it.referenciaId))
        const perc = resolverPercentualProduto(produto?.comissaoPercentual, percPadrao)
        const comissao = aplicarComissao(subtotal, perc)

        totalProdutos += subtotal
        comissaoProdutos += comissao

        itensComissao.push({
          origem: "venda",
          tipo: "produto",
          vendaId: v.id,
          agendamentoId: null,
          data: v.createdAt,
          descricao: it.nomeItem,
          cliente: v.cliente?.nome || null,
          valor: subtotal,
          percentual: perc,
          comissao
        })
      } else if (it.tipoItem === "servico") {
        // Serviços de venda só geram comissão para o vendedor se a venda for AVULSA
        // (sem agendamento vinculado), pois o caso com agendamento já foi contado acima
        if (temAgendamento) continue

        const servico = servicoMap.get(Number(it.referenciaId))
        const perc = resolverPercentualServico(servico?.comissaoPercentual, percPadrao)
        const comissao = aplicarComissao(subtotal, perc)

        totalServicos += subtotal
        comissaoServicos += comissao

        itensComissao.push({
          origem: "venda",
          tipo: "servico",
          vendaId: v.id,
          agendamentoId: null,
          data: v.createdAt,
          descricao: it.nomeItem,
          cliente: v.cliente?.nome || null,
          valor: subtotal,
          percentual: perc,
          comissao
        })
      }
    }
  }

  itensComissao.sort((a, b) => new Date(b.data) - new Date(a.data))

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      comissaoPercentualPadrao: percPadrao
    },
    periodo: { inicio, fim },
    totais: {
      totalServicos,
      totalProdutos,
      totalVendido: totalServicos + totalProdutos,
      comissaoServicos,
      comissaoProdutos,
      comissaoTotal: comissaoServicos + comissaoProdutos
    },
    itens: itensComissao
  }
}

// GET /comissoes/me — funcionário logado
export const minhasComissoes = async (req, res) => {
  try {
    if (!req.usuarioId) {
      return res.status(400).json({
        error: "Login como empresa não possui comissões"
      })
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id: req.usuarioId, empresaId: req.empresaId },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        comissaoPercentualPadrao: true
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    const { inicio, fim } = parsePeriodo(req.query)

    const dados = await calcularComissaoDoUsuario({
      empresaId: req.empresaId,
      usuario,
      inicio,
      fim
    })

    res.json(dados)
  } catch (error) {
    console.error("Erro ao calcular comissões do usuário logado:", error)
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    res.status(500).json({ error: "Erro ao calcular comissões" })
  }
}

// GET /comissoes — admin
export const listarComissoesEquipe = async (req, res) => {
  try {
    const { inicio, fim } = parsePeriodo(req.query)

    const usuarios = await prisma.usuario.findMany({
      where: {
        empresaId: req.empresaId,
        status: "ativo"
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        role: true,
        comissaoPercentualPadrao: true
      },
      orderBy: { nome: "asc" }
    })

    const resultados = await Promise.all(
      usuarios.map((usuario) =>
        calcularComissaoDoUsuario({
          empresaId: req.empresaId,
          usuario,
          inicio,
          fim
        })
      )
    )

    res.json({
      periodo: { inicio, fim },
      funcionarios: resultados
    })
  } catch (error) {
    console.error("Erro ao listar comissões da equipe:", error)
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    res.status(500).json({ error: "Erro ao listar comissões da equipe" })
  }
}

// GET /comissoes/usuario/:id — admin
export const comissoesPorUsuario = async (req, res) => {
  try {
    const { id } = req.params

    const usuario = await prisma.usuario.findFirst({
      where: {
        id: Number(id),
        empresaId: req.empresaId
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        comissaoPercentualPadrao: true
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    const { inicio, fim } = parsePeriodo(req.query)

    const dados = await calcularComissaoDoUsuario({
      empresaId: req.empresaId,
      usuario,
      inicio,
      fim
    })

    res.json(dados)
  } catch (error) {
    console.error("Erro ao calcular comissões do usuário:", error)
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    res.status(500).json({ error: "Erro ao calcular comissões" })
  }
}

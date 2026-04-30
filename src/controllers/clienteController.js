import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"

// Criar cliente
export const criarCliente = async (req, res) => {
  try {
    const {
      nome,
      telefone,
      email,
      status,
      observacoes
    } = req.body || {}

    if (!nome) {
      return res.status(400).json({
        error: "O campo nome é obrigatório"
      })
    }

    if (status && !["em_dia", "pendente"].includes(status)) {
      return res.status(400).json({
        error: "Status inválido. Use 'em_dia' ou 'pendente'"
      })
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        email,
        status: status || "em_dia",
        observacoes,
        empresaId: req.empresaId
      }
    })

    res.status(201).json(cliente)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao criar cliente" })
  }
}

// Listar clientes com busca, filtro e ordenação
export const listarClientes = async (req, res) => {
  try {
    const { busca, status, ordem } = req.query

    const where = {
      empresaId: req.empresaId
    }

    if (busca) {
      where.nome = {
        contains: busca,
        mode: "insensitive"
      }
    }

    if (status) {
      where.status = status
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: {
        nome: ordem === "desc" ? "desc" : "asc"
      }
    })

    res.json(clientes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao listar clientes" })
  }
}

//  Atualizar cliente
export const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nome,
      telefone,
      email,
      status,
      observacoes
    } = req.body || {}

    if (status && !["em_dia", "pendente"].includes(status)) {
      return res.status(400).json({
        error: "Status inválido. Use 'em_dia' ou 'pendente'"
      })
    }

    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        id: Number(id),
        empresaId: req.empresaId
      }
    })

    if (!clienteExistente) {
      return res.status(404).json({
        error: "Cliente não encontrado para esta empresa"
      })
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: {
        id: Number(id)
      },
      data: {
        nome,
        telefone,
        email,
        status,
        observacoes
      }
    })

    res.json(clienteAtualizado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao atualizar cliente" })
  }
}

//  Deletar cliente
export const deletarCliente = async (req, res) => {
  try {
    const { id } = req.params
    const { senhaConfirmacao } = req.body || {}

    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        id: Number(id),
        empresaId: req.empresaId
      }
    })

    if (!clienteExistente) {
      return res.status(404).json({
        error: "Cliente não encontrado para esta empresa"
      })
    }

    // Verificar se tem contas pendentes/parciais/vencidas
    const contasPendentes = await prisma.contaReceber.findMany({
      where: {
        clienteId: Number(id),
        empresaId: req.empresaId,
        status: {
          in: ["pendente", "parcial", "vencido"]
        }
      }
    })

    // Se tem contas pendentes, exigir confirmação com senha
    if (contasPendentes.length > 0) {
      if (!senhaConfirmacao) {
        return res.status(400).json({
          error: "Cliente possui contas pendentes",
          temContasPendentes: true,
          mensagem: `Este cliente tem ${contasPendentes.length} conta(s) pendente(s). Para deletá-lo, você precisa confirmar digitando sua senha.`,
          requerSenha: true
        })
      }

      // Validar a senha do usuário autenticado
      const usuario = await prisma.usuario.findFirst({
        where: {
          id: req.usuarioId,
          empresaId: req.empresaId
        }
      })

      if (!usuario) {
        return res.status(401).json({
          error: "Usuário não encontrado"
        })
      }

      const senhaValida = await bcrypt.compare(senhaConfirmacao, usuario.senha)

      if (!senhaValida) {
        return res.status(401).json({
          error: "Senha incorreta"
        })
      }
    }

    // Deletar em cascata: pagamentos → contas → cliente
    await prisma.$transaction(async (tx) => {
      // 1. Encontrar todas as contas desse cliente
      const contasDoCliente = await tx.contaReceber.findMany({
        where: {
          clienteId: Number(id),
          empresaId: req.empresaId
        }
      })

      // 2. Deletar todos os pagamentos dessas contas
      for (const conta of contasDoCliente) {
        await tx.pagamentoContaReceber.deleteMany({
          where: {
            contaReceberId: conta.id
          }
        })
      }

      // 3. Deletar todas as contas do cliente
      await tx.contaReceber.deleteMany({
        where: {
          clienteId: Number(id),
          empresaId: req.empresaId
        }
      })

      // 4. Deletar o cliente
      await tx.cliente.delete({
        where: {
          id: Number(id)
        }
      })
    })

    res.json({ message: "Cliente deletado com sucesso" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao deletar cliente" })
  }
}

export const detalharCliente = async (req, res) => {
  try {
    const { id } = req.params

    const cliente = await prisma.cliente.findFirst({
      where: {
        id: Number(id),
        empresaId: req.empresaId
      }
    })

    if (!cliente) {
      return res.status(404).json({
        error: "Cliente não encontrado para esta empresa"
      })
    }

    const vendas = await prisma.venda.findMany({
      where: {
        clienteId: Number(id),
        empresaId: req.empresaId
      },
      include: {
        itens: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    
    const contasReceber = await prisma.contaReceber.findMany({
      where: {
        clienteId: Number(id),
        empresaId: req.empresaId
      },
      include: {
        pagamentos: {
          orderBy: {
            createdAt: "desc"
          }
        },
        vendas: {
          include: {
            itens: true
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Buscar pagamentos diretamente com relação correta
    const pagamentos = await prisma.pagamentoContaReceber.findMany({
      where: {
        contaReceber: {
          clienteId: Number(id),
          empresaId: req.empresaId
        }
      },
      include: {
        contaReceber: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const totalComprado = vendas.reduce((total, venda) => {
      return total + Number(venda.totalFinal || 0)
    }, 0)

    const totalPago = contasReceber.reduce((total, conta) => {
      return total + Number(conta.valorPago || 0)
    }, 0)

    const totalEmAberto = contasReceber.reduce((total, conta) => {
      return total + (Number(conta.valorTotal || 0) - Number(conta.valorPago || 0))
    }, 0)

    const totalVencido = contasReceber
      .filter((conta) => conta.status === "vencido")
      .reduce((total, conta) => {
        return total + (Number(conta.valorTotal || 0) - Number(conta.valorPago || 0))
      }, 0)

    const produtosComprados = []
    const servicosRealizados = []

    for (const venda of vendas) {
      for (const item of venda.itens || []) {
        const itemFormatado = {
          vendaId: venda.id,
          nomeItem: item.nomeItem,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          subtotal: item.subtotal,
          createdAt: venda.createdAt
        }

        if (item.tipoItem === "produto") {
          produtosComprados.push(itemFormatado)
        }

        if (item.tipoItem === "servico") {
          servicosRealizados.push(itemFormatado)
        }
      }
    }

    const historico = [
      {
        tipo: "cliente_cadastrado",
        titulo: "Cliente cadastrado",
        descricao: cliente.nome,
        valor: null,
        data: cliente.createdAt
      },

      ...vendas.map((venda) => ({
        tipo: "venda",
        titulo: `Venda #${venda.id}`,
        descricao: `${venda.itens?.length || 0} item(ns)`,
        valor: venda.totalFinal,
        data: venda.createdAt
      })),

      ...contasReceber.map((conta) => ({
        tipo: "conta_receber",
        titulo: conta.descricao || `Conta #${conta.id}`,
        descricao: `Status: ${conta.status}`,
        valor: Number(conta.valorTotal || 0) - Number(conta.valorPago || 0),
        data: conta.createdAt
      })),

      ...pagamentos.map((pagamento) => ({
        tipo: "pagamento",
        titulo: `Pagamento da conta`,
        descricao:
          pagamento.descricao ||
          pagamento.contaReceber.descricao ||
          "Pagamento recebido",
        valor: pagamento.valor,
        data: pagamento.createdAt
      }))
    ].sort((a, b) => new Date(b.data) - new Date(a.data))

    res.json({
      cliente,
      resumo: {
        totalComprado,
        totalPago,
        totalEmAberto,
        totalVencido,
        quantidadeVendas: vendas.length,
        quantidadeContas: contasReceber.length
      },
      vendas,
      produtosComprados,
      servicosRealizados,
      contasReceber,
      pagamentos,
      historico
    })
} catch (error) {
  console.error("Erro ao detalhar cliente:", error)

  res.status(500).json({
    error: "Erro ao detalhar cliente",
    detalhes: error.message
  })
}}
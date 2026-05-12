import prisma from "../config/prisma.js"

const statusPermitidos = ["agendado", "concluido", "cancelado"]

const buscarServicoDaEmpresa = async ({ servicoId, empresaId }) => {
  if (!servicoId) return null

  return await prisma.servico.findFirst({
    where: {
      id: Number(servicoId),
      empresaId,
      status: "ativo"
    }
  })
}

const buscarClienteDaEmpresa = async ({ clienteId, empresaId }) => {
  if (!clienteId) return null

  return await prisma.cliente.findFirst({
    where: {
      id: Number(clienteId),
      empresaId
    }
  })
}

const buscarProfissionalDaEmpresa = async ({ profissionalId, empresaId }) => {
  if (!profissionalId) return null

  return await prisma.usuario.findFirst({
    where: {
      id: Number(profissionalId),
      empresaId,
      status: "ativo"
    }
  })
}

// Criar agendamento
export const criarAgendamento = async (req, res) => {
  try {
    const {
      clienteId,
      servicoId,
      profissionalId,
      titulo,
      descricao,
      dataHora,
      status,
      observacoes
    } = req.body || {}

    if (!titulo) {
      return res.status(400).json({
        error: "O título do agendamento é obrigatório"
      })
    }

    if (!dataHora) {
      return res.status(400).json({
        error: "A data e hora do agendamento são obrigatórias"
      })
    }

    if (req.role !== "admin" && !profissionalId) {
      return res.status(400).json({
        error: "Selecione um profissional para o agendamento"
      })
    }

    if (status && !statusPermitidos.includes(status)) {
      return res.status(400).json({
        error: "Status inválido"
      })
    }

    const cliente = await buscarClienteDaEmpresa({
      clienteId,
      empresaId: req.empresaId
    })

    if (clienteId && !cliente) {
      return res.status(404).json({
        error: "Cliente não encontrado para esta empresa"
      })
    }

    const servico = await buscarServicoDaEmpresa({
      servicoId,
      empresaId: req.empresaId
    })

    if (servicoId && !servico) {
      return res.status(404).json({
        error: "Serviço não encontrado para esta empresa"
      })
    }

    const profissional = await buscarProfissionalDaEmpresa({
      profissionalId,
      empresaId: req.empresaId
    })

    if (profissionalId && !profissional) {
      return res.status(404).json({
        error: "Profissional não encontrado ou inativo"
      })
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        clienteId: clienteId ? Number(clienteId) : null,
        servicoId: servicoId ? Number(servicoId) : null,
        profissionalId: profissionalId ? Number(profissionalId) : null,
        empresaId: req.empresaId,

        titulo,
        descricao: descricao || null,
        dataHora: new Date(dataHora),
        status: status || "agendado",
        valorServico: servico ? Number(servico.preco || 0) : null,
        observacoes: observacoes || null
      },
      include: {
        cliente: true,
        servico: true,
        profissional: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            role: true,
            status: true
          }
        },
        venda: true
      }
    })

    res.status(201).json(agendamento)
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)

    res.status(500).json({
      error: "Erro ao criar agendamento"
    })
  }
}

// Listar agendamentos
export const listarAgendamentos = async (req, res) => {
  try {
    const {
      status,
      clienteId,
      profissionalId,
      dataInicio,
      dataFim
    } = req.query

    const where = {
      empresaId: req.empresaId
    }

    if (status) {
      where.status = status
    }

    if (clienteId) {
      where.clienteId = Number(clienteId)
    }

    if (profissionalId) {
      where.profissionalId = Number(profissionalId)
    }

    if (dataInicio || dataFim) {
      where.dataHora = {}

      if (dataInicio) {
        where.dataHora.gte = new Date(dataInicio)
      }

      if (dataFim) {
        const fim = new Date(dataFim)
        fim.setHours(23, 59, 59, 999)
        where.dataHora.lte = fim
      }
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: true,
        servico: true,
        profissional: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            role: true,
            status: true
          }
        },
        venda: true
      },
      orderBy: {
        dataHora: "asc"
      }
    })

    res.json(agendamentos)
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error)

    res.status(500).json({
      error: "Erro ao listar agendamentos"
    })
  }
}

// Atualizar agendamento
export const atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params

    const {
      clienteId,
      servicoId,
      profissionalId,
      titulo,
      descricao,
      dataHora,
      status,
      observacoes
    } = req.body || {}

    if (status && !statusPermitidos.includes(status)) {
      return res.status(400).json({
        error: "Status inválido"
      })
    }

    const agendamentoExistente = await prisma.agendamento.findFirst({
      where: {
        id: Number(id),
        empresaId: req.empresaId
      }
    })

    if (!agendamentoExistente) {
      return res.status(404).json({
        error: "Agendamento não encontrado para esta empresa"
      })
    }

    if (
      req.role !== "admin" &&
      profissionalId !== undefined &&
      (profissionalId === null || profissionalId === "")
    ) {
      return res.status(400).json({
        error: "Selecione um profissional para o agendamento"
      })
    }

    let servico = null

    if (servicoId !== undefined && servicoId !== null && servicoId !== "") {
      servico = await buscarServicoDaEmpresa({
        servicoId,
        empresaId: req.empresaId
      })

      if (!servico) {
        return res.status(404).json({
          error: "Serviço não encontrado para esta empresa"
        })
      }
    }

    if (clienteId !== undefined && clienteId !== null && clienteId !== "") {
      const cliente = await buscarClienteDaEmpresa({
        clienteId,
        empresaId: req.empresaId
      })

      if (!cliente) {
        return res.status(404).json({
          error: "Cliente não encontrado para esta empresa"
        })
      }
    }

    if (
      profissionalId !== undefined &&
      profissionalId !== null &&
      profissionalId !== ""
    ) {
      const profissional = await buscarProfissionalDaEmpresa({
        profissionalId,
        empresaId: req.empresaId
      })

      if (!profissional) {
        return res.status(404).json({
          error: "Profissional não encontrado ou inativo"
        })
      }
    }

    const dados = {
      clienteId:
        clienteId === null || clienteId === ""
          ? null
          : clienteId !== undefined
          ? Number(clienteId)
          : undefined,

      servicoId:
        servicoId === null || servicoId === ""
          ? null
          : servicoId !== undefined
          ? Number(servicoId)
          : undefined,

      profissionalId:
        profissionalId === null || profissionalId === ""
          ? null
          : profissionalId !== undefined
          ? Number(profissionalId)
          : undefined,

      titulo: titulo !== undefined ? titulo : undefined,

      descricao:
        descricao === null || descricao === ""
          ? null
          : descricao !== undefined
          ? descricao
          : undefined,

      dataHora: dataHora ? new Date(dataHora) : undefined,

      status: status !== undefined ? status : undefined,

      observacoes:
        observacoes === null || observacoes === ""
          ? null
          : observacoes !== undefined
          ? observacoes
          : undefined
    }

    if (servicoId !== undefined) {
      dados.valorServico = servico ? Number(servico.preco || 0) : null
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: {
        id: Number(id)
      },
      data: dados,
      include: {
        cliente: true,
        servico: true,
        profissional: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            role: true,
            status: true
          }
        },
        venda: true
      }
    })

    res.json(agendamentoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error)

    res.status(500).json({
      error: "Erro ao atualizar agendamento",
      detalhes: error.message
    })
  }
}

// Excluir agendamento
export const excluirAgendamento = async (req, res) => {
  try {
    const { id } = req.params

    const agendamentoExistente = await prisma.agendamento.findFirst({
      where: {
        id: Number(id),
        empresaId: req.empresaId
      }
    })

    if (!agendamentoExistente) {
      return res.status(404).json({
        error: "Agendamento não encontrado para esta empresa"
      })
    }

    if (agendamentoExistente.vendaId) {
      return res.status(400).json({
        error: "Este agendamento já possui venda vinculada e não pode ser excluído"
      })
    }

    await prisma.agendamento.delete({
      where: {
        id: Number(id)
      }
    })

    res.json({
      message: "Agendamento excluído com sucesso"
    })
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error)

    res.status(500).json({
      error: "Erro ao excluir agendamento"
    })
  }
}
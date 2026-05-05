import prisma from "../config/prisma.js"

// Criar agendamento
export const criarAgendamento = async (req, res) => {
  try {
    const {
      clienteId,
      servicoId,
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

    if (clienteId) {
      const cliente = await prisma.cliente.findFirst({
        where: {
          id: Number(clienteId),
          empresaId: req.empresaId
        }
      })

      if (!cliente) {
        return res.status(404).json({
          error: "Cliente não encontrado para esta empresa"
        })
      }
    }

    if (servicoId) {
      const servico = await prisma.servico.findFirst({
        where: {
          id: Number(servicoId),
          empresaId: req.empresaId,
          status: "ativo"
        }
      })

      if (!servico) {
        return res.status(404).json({
          error: "Serviço não encontrado para esta empresa"
        })
      }
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        clienteId: clienteId ? Number(clienteId) : null,
        servicoId: servicoId ? Number(servicoId) : null,
        empresaId: req.empresaId,
        titulo,
        descricao,
        dataHora: new Date(dataHora),
        status: status || "agendado",
        observacoes
      },
      include: {
        cliente: true,
        servico: true
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
    const { status, clienteId, dataInicio, dataFim } = req.query

    const where = {
      empresaId: req.empresaId
    }

    if (status) {
      where.status = status
    }

    if (clienteId) {
      where.clienteId = Number(clienteId)
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
        servico: true
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
      titulo,
      descricao,
      dataHora,
      status,
      observacoes
    } = req.body || {}

    const statusPermitidos = ["agendado", "concluido", "cancelado"]

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

    if (clienteId) {
      const cliente = await prisma.cliente.findFirst({
        where: {
          id: Number(clienteId),
          empresaId: req.empresaId
        }
      })

      if (!cliente) {
        return res.status(404).json({
          error: "Cliente não encontrado para esta empresa"
        })
      }
    }

    if (servicoId) {
      const servico = await prisma.servico.findFirst({
        where: {
          id: Number(servicoId),
          empresaId: req.empresaId,
          status: "ativo"
        }
      })

      if (!servico) {
        return res.status(404).json({
          error: "Serviço não encontrado para esta empresa"
        })
      }
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: {
        id: Number(id)
      },
      data: {
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
      },
      include: {
        cliente: true,
        servico: true
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
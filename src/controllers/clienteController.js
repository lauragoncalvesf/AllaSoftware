import prisma from "../config/prisma.js"

// ➕ Criar cliente
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

// 📄 Listar clientes com busca, filtro e ordenação
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

// ✏️ Atualizar cliente
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

// ❌ Deletar cliente
export const deletarCliente = async (req, res) => {
  try {
    const { id } = req.params

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

    await prisma.cliente.delete({
      where: {
        id: Number(id)
      }
    })

    res.json({ message: "Cliente deletado com sucesso" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao deletar cliente" })
  }
}
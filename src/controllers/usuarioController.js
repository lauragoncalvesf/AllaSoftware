import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"

// Criar usuário
export const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body || {}

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Os campos nome, email e senha são obrigatórios"
      })
    }

    if (role && !["admin", "funcionario"].includes(role)) {
      return res.status(400).json({
        error: "Role inválida. Use 'admin' ou 'funcionario'"
      })
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        email
      }
    })

    if (usuarioExistente) {
      return res.status(400).json({
        error: "Já existe um usuário com esse email"
      })
    }

    const hash = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hash,
        role: role || "funcionario",
        empresaId: req.empresaId
      }
    })

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Erro ao criar usuário"
    })
  }
}

// Listar usuários da empresa
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        empresaId: req.empresaId
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        empresaId: true,
        createdAt: true
      },
      orderBy: {
        nome: "asc"
      }
    })

    res.json(usuarios)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Erro ao listar usuários"
    })
  }
}

export const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params

    const usuarioLogadoId = req.usuarioId

    if (Number(id) === Number(usuarioLogadoId)) {
      return res.status(400).json({
        error: "Você não pode excluir o próprio usuário logado"
      })
    }

    const usuario = await prisma.usuario.findFirst({
      where: {
        id: Number(id),
        empresaId: req.empresaId
      }
    })

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado para esta empresa"
      })
    }

    await prisma.usuario.delete({
      where: {
        id: Number(id)
      }
    })

    res.json({
      message: "Usuário removido com sucesso"
    })
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    res.status(500).json({
      error: "Erro ao deletar usuário"
    })
  }
}
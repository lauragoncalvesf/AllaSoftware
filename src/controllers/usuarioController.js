import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"

// ─── Criar usuário ───────────────────────────────────────────
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

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } })

    if (usuarioExistente) {
      return res.status(400).json({ error: "Já existe um usuário com esse email" })
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
    res.status(500).json({ error: "Erro ao criar usuário" })
  }
}

// ─── Listar usuários da empresa ──────────────────────────────
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { empresaId: req.empresaId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        empresaId: true,
        createdAt: true
      },
      orderBy: { nome: "asc" }
    })

    res.json(usuarios)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao listar usuários" })
  }
}

// ─── Deletar usuário ─────────────────────────────────────────
export const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params

    if (Number(id) === Number(req.usuarioId)) {
      return res.status(400).json({
        error: "Você não pode excluir o próprio usuário logado"
      })
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id: Number(id), empresaId: req.empresaId }
    })

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado para esta empresa" })
    }

    await prisma.usuario.delete({ where: { id: Number(id) } })

    res.json({ message: "Usuário removido com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    res.status(500).json({ error: "Erro ao deletar usuário" })
  }
}

// ─── Ver perfil do usuário logado ───────────────────────────
export const verPerfil = async (req, res) => {
  try {
    // Se for login da empresa (sem usuarioId), retorna dados da empresa
    if (!req.usuarioId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: req.empresaId },
        select: { id: true, nome: true, email: true, createdAt: true }
      })

      if (!empresa) {
        return res.status(404).json({ error: "Empresa não encontrada" })
      }

      return res.json({ tipo: "empresa", ...empresa })
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id: req.usuarioId, empresaId: req.empresaId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    res.json({ tipo: "usuario", ...usuario })
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    res.status(500).json({ error: "Erro ao buscar perfil" })
  }
}

// ─── Atualizar perfil do usuário logado ─────────────────────
export const atualizarPerfil = async (req, res) => {
  try {
    const { nome, senhaAtual, novaSenha } = req.body || {}

    // Login de empresa
    if (!req.usuarioId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: req.empresaId }
      })

      if (!empresa) {
        return res.status(404).json({ error: "Empresa não encontrada" })
      }

      const dados = {}

      if (nome) {
        if (!senhaAtual) {
          return res.status(400).json({
            error: "Informe sua senha atual para alterar o nome"
          })
        }

        const senhaCorreta = await bcrypt.compare(senhaAtual, empresa.senha)

        if (!senhaCorreta) {
          return res.status(400).json({
            error: "Senha atual incorreta"
          })
        }

        dados.nome = nome
      }

      if (Object.keys(dados).length === 0) {
        return res.status(400).json({
          error: "Nenhuma informação para atualizar"
        })
      }

      const empresaAtualizada = await prisma.empresa.update({
        where: { id: req.empresaId },
        data: dados,
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true
        }
      })

      return res.json({
        tipo: "empresa",
        ...empresaAtualizada
      })
    }

    // Login de usuário
    const usuario = await prisma.usuario.findFirst({
      where: {
        id: req.usuarioId,
        empresaId: req.empresaId
      }
    })

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      })
    }

    const dados = {}

    if (nome) {
      if (!senhaAtual) {
        return res.status(400).json({
          error: "Informe sua senha atual para alterar o nome"
        })
      }

      const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha)

      if (!senhaCorreta) {
        return res.status(400).json({
          error: "Senha atual incorreta"
        })
      }

      dados.nome = nome
    }

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({
          error: "Informe a senha atual para alterar a senha"
        })
      }

      const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha)

      if (!senhaCorreta) {
        return res.status(400).json({
          error: "Senha atual incorreta"
        })
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          error: "A nova senha deve ter pelo menos 6 caracteres"
        })
      }

      dados.senha = await bcrypt.hash(novaSenha, 10)
    }

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({
        error: "Nenhuma informação para atualizar"
      })
    }

    const atualizado = await prisma.usuario.update({
      where: {
        id: req.usuarioId
      },
      data: dados,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    res.json({
      tipo: "usuario",
      ...atualizado
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)

    res.status(500).json({
      error: "Erro ao atualizar perfil"
    })
  }
}
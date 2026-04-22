import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
  try {
    const { nomeEmpresa, nomeUsuario, email, senha } = req.body || {}

    if (!nomeEmpresa || !nomeUsuario || !email || !senha) {
      return res.status(400).json({
        error: "Os campos nomeEmpresa, nomeUsuario, email e senha são obrigatórios"
      })
    }

    const empresaExistente = await prisma.empresa.findUnique({
      where: { email }
    })

    if (empresaExistente) {
      return res.status(400).json({
        error: "Já existe uma empresa cadastrada com esse email"
      })
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      return res.status(400).json({
        error: "Já existe um usuário cadastrado com esse email"
      })
    }

    const hash = await bcrypt.hash(senha, 10)

    const empresa = await prisma.empresa.create({
      data: {
        nome: nomeEmpresa,
        email,
        senha: hash
      }
    })

    const usuarioAdmin = await prisma.usuario.create({
      data: {
        nome: nomeUsuario,
        email,
        senha: hash,
        role: "admin",
        empresaId: empresa.id
      }
    })

    res.status(201).json({
      message: "Empresa e usuário admin criados com sucesso",
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email
      },
      usuarioAdmin: {
        id: usuarioAdmin.id,
        nome: usuarioAdmin.nome,
        email: usuarioAdmin.email,
        role: usuarioAdmin.role,
        empresaId: usuarioAdmin.empresaId
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Erro ao cadastrar empresa"
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body

    const empresa = await prisma.empresa.findUnique({
      where: { email }
    })

    if (!empresa) {
      return res.status(404).json({
        error: "Empresa não encontrada"
      })
    }

    const senhaValida = await bcrypt.compare(senha, empresa.senha)

    if (!senhaValida) {
      return res.status(401).json({
        error: "Senha inválida"
      })
    }

    const token = jwt.sign(
      { empresaId: empresa.id },
      "segredo",
      { expiresIn: "1d" }
    )

    res.json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Erro ao fazer login"
    })
  }
}

export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body || {}

    const usuario = await prisma.usuario.findUnique({
      where: {
        email
      }
    })

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).json({
        error: "Senha inválida"
      })
    }

    const token = jwt.sign(
      {
        empresaId: usuario.empresaId,
        usuarioId: usuario.id,
        role: usuario.role
      },
      "segredo",
      { expiresIn: "1d" }
    )

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        empresaId: usuario.empresaId
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Erro ao fazer login do usuário"
    })
  }
}
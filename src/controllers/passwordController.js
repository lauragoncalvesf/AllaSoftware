import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { enviarEmailRecuperacaoSenha } from "../services/emailService.js"

// Solicitar recuperação de senha
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      // Não informar se o email existe por segurança
      return res.status(200).json({
        message: "Se este email estiver cadastrado, você receberá um link de recuperação"
      })
    }

    // Gerar token de recuperação (válido por 1 hora)
    const tokenRecuperacao = jwt.sign(
      { usuarioId: usuario.id, email, tipo: "recuperacao" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )

    // Enviar email
    await enviarEmailRecuperacaoSenha(email, usuario.nome, tokenRecuperacao)

    res.status(200).json({
      message: "Email de recuperação enviado com sucesso"
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao solicitar recuperação de senha" })
  }
}

// Resetar senha usando token
export const resetarSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body

    if (!token || !novaSenha) {
      return res.status(400).json({
        error: "Token e nova senha são obrigatórios"
      })
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        error: "Senha deve ter pelo menos 6 caracteres"
      })
    }

    // Verificar token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return res.status(401).json({
        error: "Token inválido ou expirado"
      })
    }

    if (decoded.tipo !== "recuperacao") {
      return res.status(401).json({
        error: "Token inválido"
      })
    }

    // Atualizar senha
    const hash = await bcrypt.hash(novaSenha, 10)

    const usuario = await prisma.usuario.update({
      where: { id: decoded.usuarioId },
      data: { senha: hash }
    })

    res.status(200).json({
      message: "Senha resetada com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao resetar senha" })
  }
}

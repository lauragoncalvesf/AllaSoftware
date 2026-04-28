import nodemailer from "nodemailer"

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "seu_email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "sua_senha_app"
  }
})

// Testar conexão
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erro na conexão com email:", error.message)
  } else {
    console.log("✅ Email configurado com sucesso")
  }
})

// Template de email de confirmação de registro
export const enviarEmailRegistro = async (email, nomeEmpresa, nomeUsuario) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Bem-vindo ao Sistema ALLA! 🎉</h2>
      
      <p>Olá <strong>${nomeUsuario}</strong>,</p>
      
      <p>Sua empresa <strong>${nomeEmpresa}</strong> foi registrada com sucesso!</p>
      
      <p>Você já pode fazer login com as credenciais fornecidas.</p>
      
      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p>Guarde sua senha com segurança.</p>
      </div>
      
      <p>Se você não criou esta conta, por favor ignore este email.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        © 2026 Sistema ALLA. Todos os direitos reservados.
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Bem-vindo ao Sistema ALLA - ${nomeEmpresa}`,
      html: htmlContent
    })
    console.log(`✅ Email enviado para ${email}`)
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${email}:`, error.message)
    // Não lançar erro - apenas logar
  }
}

// Template de email - Esqueceu senha
export const enviarEmailRecuperacaoSenha = async (email, nomeUsuario, token) => {
  const linkRecuperacao = `${process.env.FRONTEND_URL}/resetar-senha?token=${token}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Recuperação de Senha</h2>
      
      <p>Olá <strong>${nomeUsuario}</strong>,</p>
      
      <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
      
      <div style="margin: 30px 0;">
        <a href="${linkRecuperacao}" style="background-color: #3E7996; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Recuperar Senha
        </a>
      </div>
      
      <p style="color: #666; font-size: 12px;">
        Este link expira em 1 hora.<br>
        Se você não solicitou isto, ignore este email.
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        © 2026 Sistema ALLA. Todos os direitos reservados.
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperação de Senha - Sistema ALLA",
      html: htmlContent
    })
    console.log(`✅ Email de recuperação enviado para ${email}`)
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${email}:`, error.message)
  }
}

// Template - Alerta de transação
export const enviarEmailAlerta = async (email, nomeUsuario, assunto, mensagem) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">${assunto}</h2>
      
      <p>Olá <strong>${nomeUsuario}</strong>,</p>
      
      <p>${mensagem}</p>
      
      <p style="margin-top: 30px;">
        <strong>Faça login no sistema para mais detalhes:</strong><br>
        <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a>
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        © 2026 Sistema ALLA. Todos os direitos reservados.
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: assunto,
      html: htmlContent
    })
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${email}:`, error.message)
  }
}

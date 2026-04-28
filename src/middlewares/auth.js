import jwt from "jsonwebtoken"

export const auth = (req, res, next) => {
  let token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: "Token não enviado" })
  }

  // Remover "Bearer " se existir
  if (token.startsWith("Bearer ")) {
    token = token.slice(7)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.empresaId = decoded.empresaId
    req.usuarioId = decoded.usuarioId || null
    req.role = decoded.role || null

    next()
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" })
  }
}
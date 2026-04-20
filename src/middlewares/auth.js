import jwt from "jsonwebtoken"

export const auth = (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: "Token não enviado" })
  }

  try {
    const decoded = jwt.verify(token, "segredo")

    req.empresaId = decoded.empresaId
    req.usuarioId = decoded.usuarioId || null
    req.role = decoded.role || null

    next()
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" })
  }
}
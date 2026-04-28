// Middleware de tratamento de erros global
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Erro:", {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Erro de validação do Prisma
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "Dados duplicados",
      detalhes: `O campo ${err.meta?.target?.[0]} já existe`
    })
  }

  // Erro de chave estrangeira
  if (err.code === "P2003") {
    return res.status(400).json({
      error: "Referência inválida",
      detalhes: "Um dos dados referenciados não existe"
    })
  }

  // Erro de registro não encontrado
  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Registro não encontrado"
    })
  }

  // Erro genérico
  const status = err.status || 500
  const message = err.message || "Erro interno do servidor"

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  })
}

// Wrapper para async/await em rotas
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

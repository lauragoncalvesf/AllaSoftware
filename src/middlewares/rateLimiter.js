import rateLimit from "express-rate-limit"

// Rate limiter geral (100 requisições a cada 15 minutos)
export const limiterGeral = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Muitas requisições deste IP, tente novamente depois",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development"
})

// Rate limiter para login (5 tentativas a cada 15 minutos)
export const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Muitas tentativas de login, tente novamente em 15 minutos",
  skipSuccessfulRequests: true,
  standardHeaders: false,
  legacyHeaders: false
})

// Rate limiter para criar recursos (30 a cada hora)
export const limiterCriacao = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: "Limite de criação de recursos atingido, tente novamente em 1 hora",
  standardHeaders: false,
  legacyHeaders: false
})

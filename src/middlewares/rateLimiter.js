import rateLimit from "express-rate-limit"

const isDev = () => process.env.NODE_ENV === "development"

// Limite geral para uso normal da SPA. Login continua com limite proprio.
export const limiterGeral = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: {
    error: "Muitas requisicoes deste IP, tente novamente depois"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev() || req.method === "OPTIONS" || req.path === "/health"
})

export const limiterLogin = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX_REQUESTS) || 10,
  message: {
    error: "Muitas tentativas de login, tente novamente em 15 minutos"
  },
  skipSuccessfulRequests: true,
  standardHeaders: false,
  legacyHeaders: false,
  skip: (req) => isDev() || req.method === "OPTIONS"
})

export const limiterCriacao = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: {
    error: "Limite de criacao de recursos atingido, tente novamente em 1 hora"
  },
  standardHeaders: false,
  legacyHeaders: false
})

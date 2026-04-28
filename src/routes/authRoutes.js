import { register, login, loginUsuario, refreshAccessToken } from "../controllers/authController.js"
import { limiterLogin } from "../middlewares/rateLimiter.js"

export default (app) => {
  app.post("/register", limiterLogin, register)
  app.post("/login", limiterLogin, login)
  app.post("/login-usuario", limiterLogin, loginUsuario)
  app.post("/refresh-token", refreshAccessToken)
}
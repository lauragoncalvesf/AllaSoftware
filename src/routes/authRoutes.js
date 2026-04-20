import { register, login, loginUsuario } from "../controllers/authController.js"

export default (app) => {
  app.post("/register", register)
  app.post("/login", login)
  app.post("/login-usuario", loginUsuario)
}
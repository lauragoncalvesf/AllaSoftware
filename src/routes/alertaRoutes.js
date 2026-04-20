import { alertasVencimento } from "../controllers/alertaController.js"
import { auth } from "../middlewares/auth.js"

export default (app) => {
  app.get("/alertas/vencimento", auth, alertasVencimento)
}
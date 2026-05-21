import {
  dashboardFinanceiro,
  dashboardCobrancas
} from "../controllers/dashboardController.js"

import { auth } from "../middlewares/auth.js"
import { permitirPermissao } from "../middlewares/permitirPermissao.js"

export default (app) => {
  app.get("/dashboard/financeiro", auth, permitirPermissao("financeiro"), dashboardFinanceiro)
  app.get("/dashboard/cobrancas", auth, permitirPermissao("dashboard"), dashboardCobrancas)
}

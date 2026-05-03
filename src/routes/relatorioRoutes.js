// src/routes/relatorioRoutes.js
//
// Nova rota dedicada a geração e download de relatório em PDF.
// Adicione no server.js:
//   import relatorioRoutes from "./routes/relatorioRoutes.js"
//   relatorioRoutes(app)

import { auth } from "../middlewares/auth.js"
import { permitirRoles } from "../middlewares/permitirRoles.js"
import { gerarRelatorioPDF } from "../controllers/relatorioController.js"

export default (app) => {
  // GET /relatorios/pdf?periodo=mes  → baixa o PDF do relatório
  app.get(
    "/relatorios/pdf",
    auth,
    permitirRoles("admin", "gerente"),
    gerarRelatorioPDF
  )
}

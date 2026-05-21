// src/routes/relatorioRoutes.js
//
// Nova rota dedicada a geração e download de relatório em PDF.
// Adicione no server.js:
//   import relatorioRoutes from "./routes/relatorioRoutes.js"
//   relatorioRoutes(app)

import { auth } from "../middlewares/auth.js"
import { permitirPermissao } from "../middlewares/permitirPermissao.js"
import { gerarRelatorioPDF, relatorioFinanceiro } from "../controllers/relatorioController.js"

export default (app) => {
  // GET /relatorios/pdf?periodo=mes  → baixa o PDF do relatório
  app.get(
    "/relatorios/pdf",
    auth,
    permitirPermissao("relatorios"),
    gerarRelatorioPDF
  )

  app.get(
    "/relatorios/financeiro/dados",
    auth,
    permitirPermissao("relatorios"),
    relatorioFinanceiro
  )
}

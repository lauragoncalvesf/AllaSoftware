import {
  criarContaPagar,
  listarContasPagar,
  atualizarContaPagar,
  pagarContaPagar,
  cancelarContaPagar
} from "../controllers/contaPagarController.js"

import { auth } from "../middlewares/auth.js"
import { permitirPermissao } from "../middlewares/permitirPermissao.js"

export default (app) => {
  app.post("/contas-pagar", auth, permitirPermissao("contasPagar", "criar"), criarContaPagar)
  app.get("/contas-pagar", auth, permitirPermissao("contasPagar"), listarContasPagar)
  app.put("/contas-pagar/:id", auth, permitirPermissao("contasPagar", "editar"), atualizarContaPagar)
  app.post("/contas-pagar/:id/pagamentos", auth, permitirPermissao("contasPagar", "pagar"), pagarContaPagar)
  app.patch("/contas-pagar/:id/cancelar", auth, permitirPermissao("contasPagar", "excluir"), cancelarContaPagar)
}

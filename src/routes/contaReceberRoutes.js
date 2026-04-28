import {
    criarContaReceber,
    listarContasReceber,
    registrarPagamentoConta
  } from "../controllers/contaReceberController.js"
  
  import { auth } from "../middlewares/auth.js"
  import { permitirRoles } from "../middlewares/permitirRoles.js"
  
  export default (app) => {
    app.post("/contas-receber", auth, permitirRoles("admin", "gerente"), criarContaReceber)
    app.get("/contas-receber", auth, listarContasReceber)
    app.post("/contas-receber/:id/pagamentos", auth, permitirRoles("admin", "gerente"), registrarPagamentoConta)
  }
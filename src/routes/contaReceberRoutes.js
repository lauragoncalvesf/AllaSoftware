import {
    criarContaReceber,
    listarContasReceber,
    registrarPagamentoConta
  } from "../controllers/contaReceberController.js"
  
  import { auth } from "../middlewares/auth.js"
  import { permitirPermissao } from "../middlewares/permitirPermissao.js"
  
  export default (app) => {
    app.post("/contas-receber", auth, permitirPermissao("contasReceber", "criar"), criarContaReceber)
    app.get("/contas-receber", auth, permitirPermissao("contasReceber"), listarContasReceber)
    app.post("/contas-receber/:id/pagamentos", auth, permitirPermissao("contasReceber", "receberPagamento"), registrarPagamentoConta)
  }

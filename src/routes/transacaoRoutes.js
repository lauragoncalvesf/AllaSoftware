import {
    criarTransacao,
    listarTransacoes,
    resumoFinanceiro,
    atualizarTransacao,
    cancelarTransacao,
    estornarTransacao,
    listarCategoriasTransacoes
  } from "../controllers/transacaoController.js"
  
  import { auth } from "../middlewares/auth.js"
  import { permitirRoles } from "../middlewares/permitirRoles.js"
  
  export default (app) => {
    app.post("/transacoes", auth, criarTransacao)
    app.get("/transacoes", auth, listarTransacoes)
    app.get("/transacoes/resumo", auth, resumoFinanceiro)
    app.put("/transacoes/:id", auth, atualizarTransacao)
    app.patch("/transacoes/:id/cancelar", auth, cancelarTransacao)
    app.patch("/transacoes/:id/estornar", auth, permitirRoles("admin"), estornarTransacao)
    app.get("/transacoes/categorias", auth, listarCategoriasTransacoes)
  }
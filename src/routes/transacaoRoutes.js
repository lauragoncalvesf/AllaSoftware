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
  import { permitirPermissao } from "../middlewares/permitirPermissao.js"
  
  export default (app) => {
    app.post("/transacoes", auth, permitirPermissao("financeiro", "criar"), criarTransacao)
    app.get("/transacoes", auth, permitirPermissao("financeiro"), listarTransacoes)
    app.get("/transacoes/resumo", auth, permitirPermissao("financeiro"), resumoFinanceiro)
    app.put("/transacoes/:id", auth, permitirPermissao("financeiro", "editar"), atualizarTransacao)
    app.patch("/transacoes/:id/cancelar", auth, permitirPermissao("financeiro", "editar"), cancelarTransacao)
    app.patch("/transacoes/:id/estornar", auth, permitirPermissao("financeiro", "editar"), estornarTransacao)
    app.get("/transacoes/categorias", auth, permitirPermissao("financeiro"), listarCategoriasTransacoes)
  }

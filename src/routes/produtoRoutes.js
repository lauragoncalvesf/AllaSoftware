import {
    criarProduto,
    listarProdutos,
    atualizarProduto,
    excluirProduto
  } from "../controllers/produtoController.js"
  
  import { auth } from "../middlewares/auth.js"
  import { permitirPermissao } from "../middlewares/permitirPermissao.js"
  
  export default (app) => {
    app.post("/produtos", auth, permitirPermissao("produtos", "criar"), criarProduto)
    app.get("/produtos", auth, permitirPermissao("produtos"), listarProdutos)
    app.put("/produtos/:id", auth, permitirPermissao("produtos", "editar"), atualizarProduto)
    app.delete("/produtos/:id", auth, permitirPermissao("produtos", "excluir"), excluirProduto)
  }

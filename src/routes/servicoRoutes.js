import {
    criarServico,
    listarServicos,
    atualizarServico,
    excluirServico
  } from "../controllers/servicoController.js"
  
  import { auth } from "../middlewares/auth.js"
  import { permitirPermissao } from "../middlewares/permitirPermissao.js"
  
  export default (app) => {
    app.post("/servicos", auth, permitirPermissao("servicos", "criar"), criarServico)
    app.get("/servicos", auth, permitirPermissao("servicos"), listarServicos)
    app.put("/servicos/:id", auth, permitirPermissao("servicos", "editar"), atualizarServico)
    app.delete("/servicos/:id", auth, permitirPermissao("servicos", "excluir"), excluirServico)
  }

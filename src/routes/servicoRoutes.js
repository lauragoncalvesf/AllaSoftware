import {
    criarServico,
    listarServicos,
    atualizarServico,
    excluirServico
  } from "../controllers/servicoController.js"
  
  import { auth } from "../middlewares/auth.js"
  import { permitirRoles } from "../middlewares/permitirRoles.js"
  
  export default (app) => {
    app.post("/servicos", auth, criarServico)
    app.get("/servicos", auth, listarServicos)
    app.put("/servicos/:id", auth, permitirRoles("admin"), atualizarServico)
    app.delete("/servicos/:id", auth, permitirRoles("admin"), excluirServico)
  }
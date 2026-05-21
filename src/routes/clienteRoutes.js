import {
    criarCliente,
    listarClientes,
    atualizarCliente,
    deletarCliente, 
    detalharCliente
  } from "../controllers/clienteController.js"
  
  import { auth } from "../middlewares/auth.js"
  import { permitirPermissao } from "../middlewares/permitirPermissao.js"
  
  export default (app) => {
    app.post("/clientes", auth, permitirPermissao("clientes", "criar"), criarCliente)
    app.get("/clientes", auth, permitirPermissao("clientes"), listarClientes)    
    app.get("/clientes/:id/detalhes", auth, permitirPermissao("clientes"), detalharCliente)
    app.put("/clientes/:id", auth, permitirPermissao("clientes", "editar"), atualizarCliente)
    app.delete("/clientes/:id", auth, permitirPermissao("clientes", "excluir"), deletarCliente)
  }

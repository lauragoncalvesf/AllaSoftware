import {
    criarCliente,
    listarClientes,
    atualizarCliente,
    deletarCliente, 
    detalharCliente
  } from "../controllers/clienteController.js"
  
  import { auth } from "../middlewares/auth.js"
  import { permitirRoles } from "../middlewares/permitirRoles.js"
  
  export default (app) => {
    app.post("/clientes", auth, permitirRoles("admin", "gerente"), criarCliente)
    app.get("/clientes", auth, listarClientes)    
    app.get("/clientes/:id/detalhes", auth, detalharCliente)
    app.put("/clientes/:id", auth, permitirRoles("admin", "gerente"), atualizarCliente)
    app.delete("/clientes/:id", auth, permitirRoles("admin"), deletarCliente)
  }
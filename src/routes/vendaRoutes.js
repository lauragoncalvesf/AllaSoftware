import { criarVenda, listarVendas } from "../controllers/vendaController.js"
import { auth } from "../middlewares/auth.js"
import { permitirPermissao } from "../middlewares/permitirPermissao.js"

export default (app) => {
  app.post("/vendas", auth, permitirPermissao("vendas", "criar"), criarVenda)
  app.get("/vendas", auth, permitirPermissao("vendas"), listarVendas)
}

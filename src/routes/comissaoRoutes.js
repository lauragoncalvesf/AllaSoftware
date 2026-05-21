import {
  minhasComissoes,
  listarComissoesEquipe,
  comissoesPorUsuario
} from "../controllers/comissaoController.js"

import { auth } from "../middlewares/auth.js"
import { permitirPermissao } from "../middlewares/permitirPermissao.js"

export default (app) => {
  app.get("/comissoes/me", auth, minhasComissoes)
  app.get("/comissoes", auth, permitirPermissao("usuarios"), listarComissoesEquipe)
  app.get("/comissoes/usuario/:id", auth, permitirPermissao("usuarios"), comissoesPorUsuario)
}

import {
  minhasComissoes,
  listarComissoesEquipe,
  comissoesPorUsuario
} from "../controllers/comissaoController.js"

import { auth } from "../middlewares/auth.js"
import { permitirRoles } from "../middlewares/permitirRoles.js"

export default (app) => {
  app.get("/comissoes/me", auth, minhasComissoes)
  app.get("/comissoes", auth, permitirRoles("admin"), listarComissoesEquipe)
  app.get("/comissoes/usuario/:id", auth, permitirRoles("admin"), comissoesPorUsuario)
}

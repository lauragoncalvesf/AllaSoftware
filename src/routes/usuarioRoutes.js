import { criarUsuario, listarUsuarios, deletarUsuario, verPerfil, atualizarPerfil} from "../controllers/usuarioController.js"
import { auth } from "../middlewares/auth.js"
import { permitirRoles } from "../middlewares/permitirRoles.js"


export default (app) => {
  app.post("/usuarios", auth, permitirRoles("admin"), criarUsuario)
  app.get("/usuarios", auth, permitirRoles("admin"), listarUsuarios)
  app.delete("/usuarios/:id", auth, permitirRoles("admin"), deletarUsuario)
  app.get("/perfil", auth, verPerfil)
  app.put("/perfil", auth, atualizarPerfil)
}

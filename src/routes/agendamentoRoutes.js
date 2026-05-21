import {
  criarAgendamento,
  listarAgendamentos,
  atualizarAgendamento,
  excluirAgendamento, 
  concluirAgendamento
} from "../controllers/agendamentoController.js"

import { auth } from "../middlewares/auth.js"
import { permitirPermissao } from "../middlewares/permitirPermissao.js"

export default (app) => {
  app.post("/agendamentos", auth, permitirPermissao("agendamentos", "criar"), criarAgendamento)
  app.get("/agendamentos", auth, permitirPermissao("agendamentos"), listarAgendamentos)
  app.put("/agendamentos/:id", auth, permitirPermissao("agendamentos", "editar"), atualizarAgendamento)
  app.delete("/agendamentos/:id", auth, permitirPermissao("agendamentos", "excluir"), excluirAgendamento)
  app.post("/agendamentos/:id/concluir", auth, permitirPermissao("agendamentos", "editar"), concluirAgendamento)
}

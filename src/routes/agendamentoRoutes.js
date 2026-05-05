import {
  criarAgendamento,
  listarAgendamentos,
  atualizarAgendamento,
  excluirAgendamento
} from "../controllers/agendamentoController.js"

import { auth } from "../middlewares/auth.js"

export default (app) => {
  app.post("/agendamentos", auth, criarAgendamento)
  app.get("/agendamentos", auth, listarAgendamentos)
  app.put("/agendamentos/:id", auth, atualizarAgendamento)
  app.delete("/agendamentos/:id", auth, excluirAgendamento)
}
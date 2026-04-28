import { solicitarRecuperacaoSenha, resetarSenha } from "../controllers/passwordController.js"

export default (app) => {
  app.post("/esqueceu-senha", solicitarRecuperacaoSenha)
  app.post("/resetar-senha", resetarSenha)
}

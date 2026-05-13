import { Navigate } from "react-router-dom"
import { podeAcessar } from "../utils/permissoes"

export default function PermissaoRoute({ modulo, acao = "visualizar", children }) {
  const permitido = podeAcessar(modulo, acao)

  if (!permitido) {
    return <Navigate to="/acesso-negado" replace />
  }

  return children
}
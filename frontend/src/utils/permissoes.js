export const getUsuarioLogado = () => {
  try {
    return JSON.parse(localStorage.getItem("usuario"))
  } catch {
    return null
  }
}

export const podeAcessar = (modulo, acao = "visualizar") => {
  const usuario = getUsuarioLogado()

  if (!usuario) return false

  if (usuario.role === "admin") return true

  const aliases = {
    "contas-receber": "contasReceber",
    "contas-pagar": "contasPagar",
    equipe: "usuarios",
    comissoes: "usuarios"
  }

  const chaveModulo = aliases[modulo] || modulo

  return usuario?.permissoes?.[chaveModulo]?.[acao] === true
}

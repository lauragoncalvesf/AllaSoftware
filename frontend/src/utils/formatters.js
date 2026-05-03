export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
}

export function formatarData(data) {
  if (!data) return "-"
  return new Date(data).toLocaleDateString("pt-BR")
}

export function formatarDataHora(data) {
  if (!data) return "-"
  return new Date(data).toLocaleString("pt-BR")
}

export function formatarFormaPagamento(forma) {
  const formas = {
    dinheiro: "Dinheiro",
    pix: "Pix",
    cartao_credito: "Cartão de crédito",
    cartao_debito: "Cartão de débito"
  }
  return formas[forma] || "Não informado"
}
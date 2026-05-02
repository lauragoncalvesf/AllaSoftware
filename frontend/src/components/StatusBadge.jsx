// Cobre status de contas a receber: pendente, parcial, vencido, pago
// E status de transações: ativa, cancelada, estornada
const estilos = {
  pendente:  "bg-amber-100 text-amber-700",
  parcial:   "bg-blue-100 text-blue-700",
  vencido:   "bg-red-100 text-red-700",
  pago:      "bg-emerald-100 text-emerald-700",
  ativa:     "bg-emerald-100 text-emerald-700",
  cancelada: "bg-gray-100 text-gray-600",
  estornada: "bg-amber-100 text-amber-700"
}

const labels = {
  pendente:  "Pendente",
  parcial:   "Parcial",
  vencido:   "Vencido",
  pago:      "Pago",
  ativa:     "Ativa",
  cancelada: "Cancelada",
  estornada: "Estornada"
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${
        estilos[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] || status}
    </span>
  )
}
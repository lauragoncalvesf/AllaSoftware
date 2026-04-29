import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"

export default function ClienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarCliente()
  }, [id])

  const carregarCliente = async () => {
    try {
      setLoading(true)

      const response = await api.get("/clientes")
      const clienteEncontrado = response.data.find(
        (item) => String(item.id) === String(id)
      )

      setCliente(clienteEncontrado || null)
    } catch (error) {
      console.error("Erro ao carregar cliente:", error)
      setCliente(null)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data) => {
    if (!data) return "-"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="text-gray-600">Carregando cliente...</p>
      </AppLayout>
    )
  }

  if (!cliente) {
    return (
      <AppLayout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-[#2D2E47] mb-2">
            Cliente não encontrado
          </h1>

          <p className="text-gray-500 mb-4">
            Não foi possível localizar esse cliente.
          </p>

          <button
            onClick={() => navigate("/clientes")}
            className="bg-[#2F8AA3] text-white px-5 py-2.5 rounded-xl hover:opacity-90"
          >
            Voltar para clientes
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/clientes")}
              className="text-sm text-[#3E7996] hover:underline mb-2"
            >
              ← Voltar para clientes
            </button>

            <h1 className="text-3xl font-bold text-[#2D2E47]">
              {cliente.nome}
            </h1>

            <p className="text-gray-500 mt-1">
              Informações básicas do cliente
            </p>
          </div>

          <span
            className={`text-sm font-semibold px-4 py-2 rounded-full w-fit ${
              cliente.status === "pendente"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {cliente.status === "pendente" ? "Pendente" : "Em dia"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <InfoCard titulo="Telefone" valor={cliente.telefone || "Não informado"} />
          <InfoCard titulo="Email" valor={cliente.email || "Não informado"} />
          <InfoCard titulo="Cadastro" valor={formatarData(cliente.createdAt)} />
          <InfoCard
            titulo="Status"
            valor={cliente.status === "pendente" ? "Pendente" : "Em dia"}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#2D2E47] mb-3">
            Observações
          </h2>

          <p className="text-gray-600">
            {cliente.observacoes || "Nenhuma observação cadastrada para este cliente."}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate(`/clientes/${cliente.id}/financeiro`)}
            className="bg-[#2F8AA3] text-white px-5 py-2.5 rounded-xl hover:opacity-90"
          >
            Ver financeiro do cliente
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

function InfoCard({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-lg font-semibold text-[#2D2E47] mt-2">{valor}</p>
    </div>
  )
}
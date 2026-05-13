import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import { formatarData } from "../utils/formatters"
import StatusBadge from "../components/StatusBadge"

export default function ClienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)

  const [agendamentos, setAgendamentos] = useState([])

  useEffect(() => {
    carregarCliente()
    carregarAgendamentosCliente()
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

  const carregarAgendamentosCliente = async () => {
    try {
      const res = await api.get(`/agendamentos?clienteId=${id}`)
      setAgendamentos(res.data || [])
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
      setAgendamentos([])
    }
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

  const agora = new Date()

  const proximosAgendamentos = agendamentos
    .filter((agendamento) => {
      if (!agendamento.dataHora) return false

      return (
        agendamento.status === "agendado" &&
        new Date(agendamento.dataHora) >= agora
      )
    })
    .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))

  const historicoAgendamentos = agendamentos
    .filter((agendamento) =>
      ["concluido", "cancelado"].includes(agendamento.status)
    )
    .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))


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

          <StatusBadge status={cliente.status === "em_dia" ? "pago" : cliente.status} />
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#2D2E47]">
            Agendamentos do cliente
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Próximos atendimentos e histórico deste cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/agendamentos?clienteId=${cliente.id}&clienteNome=${encodeURIComponent(cliente.nome)}`
            )
          }
          className="px-4 py-2 rounded-xl bg-[#2F8AA3] text-white text-sm hover:opacity-90"
        >
          Ver na agenda
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-[#2D2E47] mb-3">
            Próximos agendamentos
          </h3>

          {proximosAgendamentos.length === 0 ? (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
              Nenhum próximo agendamento.
            </p>
          ) : (
            <div className="space-y-3">
              {proximosAgendamentos.map((agendamento) => (
                <CardAgendamentoCliente
                  key={agendamento.id}
                  agendamento={agendamento}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#2D2E47] mb-3">
            Histórico
          </h3>

          {historicoAgendamentos.length === 0 ? (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
              Nenhum histórico de agendamento.
            </p>
          ) : (
            <div className="space-y-3">
              {historicoAgendamentos.slice(0, 5).map((agendamento) => (
                <CardAgendamentoCliente
                  key={agendamento.id}
                  agendamento={agendamento}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#2D2E47] mb-3">
            Observações
          </h2>

          <p className="text-gray-600">
            {cliente.observacoes || "Nenhuma observação cadastrada para este cliente."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => navigate(`/vendas?clienteId=${cliente.id}&clienteNome=${encodeURIComponent(cliente.nome)}`)}
            className="bg-[#2F8AA3] text-white px-5 py-2.5 rounded-xl hover:opacity-90"
          >
            Realizar venda para este cliente
          </button>

          <button
            onClick={() => navigate(`/clientes/${cliente.id}/financeiro`)}
            className="bg-white border border-gray-200 text-[#2D2E47] px-5 py-2.5 rounded-xl hover:bg-gray-50"
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

function CardAgendamentoCliente({ agendamento }) {
  const formatarDataHoraLocal = (data) => {
    if (!data) return "-"

    return new Date(data).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    })
  }

  const formatarMoedaLocal = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  const statusClasses = {
    agendado: "bg-[#2F8AA3]/10 text-[#2F8AA3]",
    concluido: "bg-emerald-100 text-emerald-700",
    cancelado: "bg-red-100 text-red-700"
  }

  const statusLabel = {
    agendado: "Agendado",
    concluido: "Concluído",
    cancelado: "Cancelado"
  }

  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[#2D2E47]">
            {agendamento.titulo}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            {formatarDataHoraLocal(agendamento.dataHora)}
          </p>
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            statusClasses[agendamento.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabel[agendamento.status] || agendamento.status}
        </span>
      </div>

      <div className="mt-3 text-sm text-gray-500 space-y-1">
        <p>
          Serviço:{" "}
          <span className="font-medium text-[#2D2E47]">
            {agendamento.servico?.nome || "-"}
          </span>
        </p>

        <p>
          Profissional:{" "}
          <span className="font-medium text-[#2D2E47]">
            {agendamento.profissional?.nome || "-"}
          </span>
        </p>

        <p>
          Valor:{" "}
          <span className="font-medium text-[#2D2E47]">
            {formatarMoedaLocal(agendamento.valorServico)}
          </span>
        </p>

        {agendamento.vendaId && (
          <p>
            Venda:{" "}
            <span className="font-medium text-[#2D2E47]">
              #{agendamento.vendaId}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
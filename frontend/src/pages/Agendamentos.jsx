import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import Modal from "../components/Modal"
import ModalAviso from "../components/ModalAviso"
import ResumoCard from "../components/ResumoCard"
import StatusBadge from "../components/StatusBadge"
import CampoInput from "../components/CampoInput"
import CampoSelect from "../components/CampoSelect"
import CampoTextarea from "../components/CampoTextarea"
import ClienteSearchSelect from "../components/ClienteSearchSelect.jsx"
import { formatarData, formatarDataHora } from "../utils/formatters"

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicos, setServicos] = useState([])

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const [statusFiltro, setStatusFiltro] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [agendamentoEditandoId, setAgendamentoEditandoId] = useState(null)

  const [form, setForm] = useState({
    clienteId: "",
    clienteNome: "",
    servicoId: "",
    titulo: "",
    descricao: "",
    dataHora: "",
    status: "agendado",
    observacoes: ""
  })

  useEffect(() => {
    carregarBase()
  }, [])

  useEffect(() => {
    carregarAgendamentos()
  }, [statusFiltro, dataInicio, dataFim])

  const carregarBase = async () => {
    try {
      const [clientesRes, servicosRes] = await Promise.all([
        api.get("/clientes"),
        api.get("/servicos")
      ])

      setClientes(clientesRes.data || [])
      setServicos(servicosRes.data || [])
    } catch (error) {
      console.error("Erro ao carregar base de agendamentos:", error)
      setAviso({
        titulo: "Atenção",
        mensagem: "Não foi possível carregar clientes e serviços. Tente recarregar a página."
      })
    }
  }

  const carregarAgendamentos = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (statusFiltro) params.append("status", statusFiltro)
      if (dataInicio) params.append("dataInicio", dataInicio)

      // Ajuste do dataFim para cobrir o dia inteiro até 23:59:59
      if (dataFim) {
        const fim = new Date(dataFim)
        fim.setHours(23, 59, 59, 999)
        params.append("dataFim", fim.toISOString())
      }

      const response = await api.get(`/agendamentos?${params.toString()}`)
      setAgendamentos(response.data || [])
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const resumo = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10)

    return {
      total: agendamentos.length,
      agendados: agendamentos.filter((a) => a.status === "agendado").length,
      concluidos: agendamentos.filter((a) => a.status === "concluido").length,
      hoje: agendamentos.filter(
        (a) => a.dataHora && new Date(a.dataHora).toISOString().slice(0, 10) === hoje
      ).length
    }
  }, [agendamentos])

  const abrirNovoAgendamento = () => {
    setModoEdicao(false)
    setAgendamentoEditandoId(null)
    setForm({
      clienteId: "",
      clienteNome: "",
      servicoId: "",
      titulo: "",
      descricao: "",
      dataHora: "",
      status: "agendado",
      observacoes: ""
    })
    setMostrarModal(true)
  }

  const abrirEditarAgendamento = (agendamento) => {
    setModoEdicao(true)
    setAgendamentoEditandoId(agendamento.id)
    setForm({
      clienteId: agendamento.clienteId ? String(agendamento.clienteId) : "",
      clienteNome: agendamento.cliente?.nome || "",
      servicoId: agendamento.servicoId ? String(agendamento.servicoId) : "",
      titulo: agendamento.titulo || "",
      descricao: agendamento.descricao || "",
      dataHora: formatarDataHoraInput(agendamento.dataHora),
      status: agendamento.status || "agendado",
      observacoes: agendamento.observacoes || ""
    })
    setMostrarModal(true)
  }

  const salvarAgendamento = async (e) => {
    e.preventDefault()

    if (!form.titulo.trim()) {
      setAviso({ titulo: "Atenção", mensagem: "Informe o título do agendamento." })
      return
    }

    if (!form.dataHora) {
      setAviso({ titulo: "Atenção", mensagem: "Informe a data e hora do agendamento." })
      return
    }

    try {
      setSalvando(true)

      const payload = {
        clienteId: form.clienteId ? Number(form.clienteId) : null,
        servicoId: form.servicoId ? Number(form.servicoId) : null,
        titulo: form.titulo,
        descricao: form.descricao || null,
        dataHora: form.dataHora,
        status: form.status,
        observacoes: form.observacoes || null
      }

      if (modoEdicao) {
        await api.put(`/agendamentos/${agendamentoEditandoId}`, payload)
      } else {
        await api.post("/agendamentos", payload)
      }

      setMostrarModal(false)
      carregarAgendamentos()
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error)
      setAviso({
        titulo: "Erro",
        mensagem: error.response?.data?.error || "Erro ao salvar agendamento"
      })
    } finally {
      setSalvando(false)
    }
  }

  const atualizarStatus = async (agendamento, novoStatus) => {
    try {
      await api.put(`/agendamentos/${agendamento.id}`, { status: novoStatus })
      carregarAgendamentos()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      setAviso({
        titulo: "Erro",
        mensagem: error.response?.data?.error || "Erro ao atualizar status"
      })
    }
  }

  const excluirAgendamento = (id) => {
    setAviso({
      titulo: "Excluir agendamento",
      mensagem: "Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.",
      tipo: "confirmacao",
      labelConfirmar: "Excluir",
      corConfirmar: "bg-red-600",
      onConfirmar: async () => {
        try {
          await api.delete(`/agendamentos/${id}`)
          setAviso(null)
          carregarAgendamentos()
        } catch (error) {
          console.error("Erro ao excluir agendamento:", error)
          setAviso({
            titulo: "Erro",
            mensagem: error.response?.data?.error || "Erro ao excluir agendamento"
          })
        }
      }
    })
  }

  const limparFiltros = () => {
    setStatusFiltro("")
    setDataInicio("")
    setDataFim("")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
              Agendamentos
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Organize horários, clientes e serviços agendados.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirNovoAgendamento}
            className="bg-[#2F8AA3] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm"
          >
            + Novo Agendamento
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard titulo="Total" valor={resumo.total} corIcone="bg-blue-100 text-blue-600" />
          <ResumoCard titulo="Agendados" valor={resumo.agendados} corIcone="bg-amber-100 text-amber-600" />
          <ResumoCard titulo="Concluídos" valor={resumo.concluidos} corIcone="bg-emerald-100 text-emerald-600" />
          <ResumoCard titulo="Hoje" valor={resumo.hoje} corIcone="bg-violet-100 text-violet-600" />
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Todos", value: "" },
              { label: "Agendados", value: "agendado" },
              { label: "Concluídos", value: "concluido" },
              { label: "Cancelados", value: "cancelado" }
            ].map((filtro) => (
              <FiltroBotao
                key={filtro.value}
                ativo={statusFiltro === filtro.value}
                texto={filtro.label}
                onClick={() => setStatusFiltro(filtro.value)}
              />
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full md:w-44 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3E7996]"
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full md:w-44 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3E7996]"
            />

            <button
              type="button"
              onClick={limparFiltros}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-500">Carregando agendamentos...</div>
          ) : agendamentos.length === 0 ? (
            <div className="p-6 text-gray-500">Nenhum agendamento encontrado.</div>
          ) : (
            <>
              {/* Tabela desktop */}
              <div className="hidden xl:block">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-500 border-b border-gray-100">
                  <div className="col-span-3">Agendamento</div>
                  <div className="col-span-2">Cliente</div>
                  <div className="col-span-2">Serviço</div>
                  <div className="col-span-2">Data/Hora</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2 text-right">Ações</div>
                </div>

                {agendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="col-span-3 min-w-0">
                      <p className="font-semibold text-[#2D2E47] truncate">
                        {agendamento.titulo}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {agendamento.descricao || "Sem descrição"}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-gray-600">
                        {agendamento.cliente?.nome || "Sem cliente"}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-gray-600">
                        {agendamento.servico?.nome || "Sem serviço"}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <div>
                        <p className="text-sm font-medium text-[#2D2E47]">
                          {formatarDataHora(agendamento.dataHora)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Criado em {formatarData(agendamento.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-1 flex items-center">
                      <StatusBadge status={agendamento.status} />
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2 flex-wrap">
                      {agendamento.status === "agendado" && (
                        <>
                          <button
                            type="button"
                            onClick={() => atualizarStatus(agendamento, "concluido")}
                            className="text-xs px-3 py-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            Concluir
                          </button>

                          <button
                            type="button"
                            onClick={() => atualizarStatus(agendamento, "cancelado")}
                            className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Cancelar
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => abrirEditarAgendamento(agendamento)}
                        className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => excluirAgendamento(agendamento.id)}
                        className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cards mobile */}
              <div className="xl:hidden p-4 space-y-4">
                {agendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="border border-gray-100 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#2D2E47]">
                          {agendamento.titulo}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {agendamento.descricao || "Sem descrição"}
                        </p>
                      </div>

                      <StatusBadge status={agendamento.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <InfoMini label="Cliente" valor={agendamento.cliente?.nome || "Sem cliente"} />
                      <InfoMini label="Serviço" valor={agendamento.servico?.nome || "Sem serviço"} />
                      <InfoMini label="Data/Hora" valor={formatarDataHora(agendamento.dataHora)} />
                      <InfoMini label="Criado em" valor={formatarData(agendamento.createdAt)} />
                    </div>

                    {agendamento.observacoes && (
                      <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                        {agendamento.observacoes}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      {agendamento.status === "agendado" && (
                        <>
                          <button
                            type="button"
                            onClick={() => atualizarStatus(agendamento, "concluido")}
                            className="text-sm px-3 py-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            Concluir
                          </button>

                          <button
                            type="button"
                            onClick={() => atualizarStatus(agendamento, "cancelado")}
                            className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Cancelar
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => abrirEditarAgendamento(agendamento)}
                        className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => excluirAgendamento(agendamento.id)}
                        className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 text-sm text-gray-500 border-t border-gray-100">
                Mostrando {agendamentos.length} agendamento(s)
              </div>
            </>
          )}
        </div>
      </div>

      {mostrarModal && (
        <Modal
          titulo={modoEdicao ? "Editar Agendamento" : "Novo Agendamento"}
          onClose={() => setMostrarModal(false)}
        >
          <form onSubmit={salvarAgendamento} className="space-y-4">
            <CampoInput
              label="Título *"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ex: Banho e tosa"
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#2D2E47] mb-2">
                Cliente
              </label>

              <ClienteSearchSelect
                clientes={clientes}
                clienteId={form.clienteId}
                setClienteId={(id) => setForm({ ...form, clienteId: id })}
                buscaInicial={form.clienteNome}
                placeholder="Digite o nome do cliente"
                permitirSemCliente={true}
                onSelect={(cliente) =>
                  setForm({
                    ...form,
                    clienteId: String(cliente.id),
                    clienteNome: cliente.nome
                  })
                }
              />
            </div>

            <CampoSelect
              label="Serviço"
              value={form.servicoId}
              onChange={(e) => {
                const servicoSelecionado = servicos.find(
                  (s) => String(s.id) === String(e.target.value)
                )
                setForm({
                  ...form,
                  servicoId: e.target.value,
                  titulo: !form.titulo && servicoSelecionado ? servicoSelecionado.nome : form.titulo
                })
              }}
              options={[
                { value: "", label: "Sem serviço" },
                ...servicos.map((s) => ({ value: String(s.id), label: s.nome }))
              ]}
            />

            <CampoInput
              label="Data e hora *"
              type="datetime-local"
              value={form.dataHora}
              onChange={(e) => setForm({ ...form, dataHora: e.target.value })}
              required
            />

            <CampoSelect
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: "agendado", label: "Agendado" },
                { value: "concluido", label: "Concluído" },
                { value: "cancelado", label: "Cancelado" }
              ]}
            />

            <CampoTextarea
              label="Descrição"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Detalhes do atendimento"
            />

            <CampoTextarea
              label="Observações"
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              placeholder="Observações internas"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvando}
                className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90 disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar Agendamento"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {aviso && (
        <ModalAviso
          {...aviso}
          onClose={() => setAviso(null)}
        />
      )}
    </AppLayout>
  )
}

function formatarDataHoraInput(data) {
  if (!data) return ""
  const dataObj = new Date(data)
  const offset = dataObj.getTimezoneOffset()
  const local = new Date(dataObj.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function FiltroBotao({ ativo, texto, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
        ativo
          ? "bg-[#2F8AA3] text-white"
          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {texto}
    </button>
  )
}

function InfoMini({ label, valor }) {
  return (
    <div>
      <p className="text-gray-400">{label}</p>
      <p className="font-medium text-[#2D2E47]">{valor}</p>
    </div>
  )
}
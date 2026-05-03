import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import { formatarMoeda, formatarData, formatarFormaPagamento} from "../utils/formatters"
import Modal from "../components/Modal"
import ResumoCard from "../components/ResumoCard"
import StatusBadge from "../components/StatusBadge"
import CampoInput from "../components/CampoInput"
import CampoSelect from "../components/CampoSelect"
import ModalAviso from "../components/ModalAviso"


export default function Transacoes() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)

  const [periodo, setPeriodo] = useState("")
  const [categoria, setCategoria] = useState("")
  const [status, setStatus] = useState("ativa")

  const [mostrarModal, setMostrarModal] = useState(false)
  const [aviso, setAviso] = useState(null)

  const [novaTransacao, setNovaTransacao] = useState({
    tipo: "entrada",
    valor: "",
    categoria: "",
    descricao: "",
    formaPagamento: ""
  })

  useEffect(() => {
    carregarTransacoes()
  }, [periodo, categoria, status])

  const carregarTransacoes = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (periodo) params.append("periodo", periodo)
      if (categoria) params.append("categoria", categoria)
      if (status) params.append("status", status)

      const response = await api.get(`/transacoes?${params.toString()}`)
      setTransacoes(response.data || [])
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
    } finally {
      setLoading(false)
    }
  }

  const resumo = useMemo(() => {
    const entradas = transacoes
      .filter((t) => t.tipo === "entrada" && t.status === "ativa")
      .reduce((acc, t) => acc + Number(t.valor || 0), 0)

    const saidas = transacoes
      .filter((t) => t.tipo === "saida" && t.status === "ativa")
      .reduce((acc, t) => acc + Number(t.valor || 0), 0)

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      total: transacoes.length
    }
  }, [transacoes])

  const criarTransacao = async (e) => {
    e.preventDefault()

    try {
      await api.post("/transacoes", {
        tipo: novaTransacao.tipo,
        valor: Number(novaTransacao.valor),
        categoria: novaTransacao.categoria || null,
        descricao: novaTransacao.descricao || null,
        formaPagamento: novaTransacao.formaPagamento || null
      })

      setNovaTransacao({
        tipo: "entrada",
        valor: "",
        categoria: "",
        descricao: "",
        formaPagamento: ""
      })

      setMostrarModal(false)
      carregarTransacoes()
    } catch (error) {
      console.error("Erro ao criar transação:", error)
      setAviso({ titulo: "Erro", mensagem: error.response?.data?.error || "Erro ao criar transação" })
    }
  }

  const cancelarTransacao = async (id) => {
    const confirmar = window.confirm("Deseja cancelar esta transação?")
    if (!confirmar) return

    try {
      await api.patch(`/transacoes/${id}/cancelar`)
      carregarTransacoes()
    } catch (error) {
      console.error("Erro ao cancelar transação:", error)
      setAviso({ titulo: "Erro", mensagem: error.response?.data?.error || "Erro ao cancelar transação" })
    }
  }

  const estornarTransacao = async (id) => {
    const confirmar = window.confirm("Deseja estornar esta transação?")
    if (!confirmar) return

    try {
      await api.patch(`/transacoes/${id}/estornar`)
      carregarTransacoes()
    } catch (error) {
      console.error("Erro:", error)
      console.error("Resposta:", error.response?.data)
      console.error("Status:", error.response?.status)
    
      setAviso({ titulo: "Erro", mensagem: error.response?.data?.error || "Erro ao executar ação" })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
              Financeiro
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe entradas, saídas, saldo e movimentações financeiras.
            </p>
          </div>

          <button
            onClick={() => setMostrarModal(true)}
            className="bg-[#2F8AA3] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm"
          >
            + Nova Transação
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard
            titulo="Entradas"
            valor={formatarMoeda(resumo.entradas)}
            subtitulo="Receitas ativas"
            corIcone="bg-emerald-100 text-emerald-600"
          />

          <ResumoCard
            titulo="Saídas"
            valor={formatarMoeda(resumo.saidas)}
            subtitulo="Despesas ativas"
            corIcone="bg-red-100 text-red-600"
          />

          <ResumoCard
            titulo="Saldo"
            valor={formatarMoeda(resumo.saldo)}
            subtitulo="Entradas - saídas"
            corIcone="bg-blue-100 text-blue-600"
          />

          <ResumoCard
            titulo="Movimentações"
            valor={resumo.total}
            subtitulo="Registros filtrados"
            corIcone="bg-violet-100 text-violet-600"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPeriodo("")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                periodo === ""
                  ? "bg-[#2F8AA3] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Geral
            </button>

            <button
              type="button"
              onClick={() => setPeriodo("hoje")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                periodo === "hoje"
                  ? "bg-[#2F8AA3] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() => setPeriodo("7dias")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                periodo === "7dias"
                  ? "bg-[#2F8AA3] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              7 dias
            </button>

            <button
              type="button"
              onClick={() => setPeriodo("mes")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                periodo === "mes"
                  ? "bg-[#2F8AA3] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Mês
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Filtrar por categoria"
              className="w-full md:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3E7996]"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full md:w-48 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3E7996]"
            >
              <option value="ativa">Ativas</option>
              <option value="cancelada">Canceladas</option>
              <option value="estornada">Estornadas</option>
              <option value="">Todas</option>
            </select>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-500">Carregando transações...</div>
          ) : transacoes.length === 0 ? (
            <div className="p-6 text-gray-500">Nenhuma transação encontrada.</div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden xl:block">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-500 border-b border-gray-100">
                  <div className="col-span-3">Descrição</div>
                  <div className="col-span-2">Categoria</div>
                  <div className="col-span-2">Pagamento</div>
                  <div className="col-span-2">Data</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Valor</div>
                  <div className="col-span-1 text-right">Ações</div>
                </div>

                {transacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="col-span-3 min-w-0">
                      <p className="font-semibold text-[#2D2E47] truncate">
                        {transacao.descricao || "Sem descrição"}
                      </p>
                      <p className="text-sm text-gray-500">
                        #{transacao.id} • {transacao.tipo === "entrada" ? "Entrada" : "Saída"}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-gray-600">
                        {transacao.categoria || "Sem categoria"}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-gray-600">
                        {formatarFormaPagamento(transacao.formaPagamento)}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-gray-600">
                        {formatarData(transacao.createdAt)}
                      </p>
                    </div>

                    <div className="col-span-1 flex items-center">
                      <StatusBadge status={transacao.status} />
                    </div>

                    <div className="col-span-1 flex items-center">
                      <p
                        className={`font-semibold ${
                          transacao.tipo === "entrada"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatarMoeda(transacao.valor)}
                      </p>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-2">
                      {transacao.status === "ativa" && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => cancelarTransacao(transacao.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Cancelar
                          </button>

                          <button
                            onClick={() => estornarTransacao(transacao.id)}
                            className="text-xs text-[#3E7996] hover:underline"
                          >
                            Estornar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile */}
              <div className="xl:hidden p-4 space-y-4">
                {transacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="border border-gray-100 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#2D2E47]">
                          {transacao.descricao || "Sem descrição"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          #{transacao.id} • {transacao.tipo === "entrada" ? "Entrada" : "Saída"}
                        </p>
                      </div>

                      <StatusBadge status={transacao.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Categoria</p>
                        <p className="font-medium text-[#2D2E47]">
                          {transacao.categoria || "Sem categoria"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Pagamento</p>
                        <p className="font-medium text-[#2D2E47]">
                          {formatarFormaPagamento(transacao.formaPagamento)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Data</p>
                        <p className="font-medium text-[#2D2E47]">
                          {formatarData(transacao.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Valor</p>
                        <p
                          className={`font-semibold ${
                            transacao.tipo === "entrada"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatarMoeda(transacao.valor)}
                        </p>
                      </div>
                    </div>

                    {transacao.status === "ativa" && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => cancelarTransacao(transacao.id)}
                          className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Cancelar
                        </button>

                        <button
                          onClick={() => estornarTransacao(transacao.id)}
                          className="text-sm px-3 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Estornar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 text-sm text-gray-500 border-t border-gray-100">
                Mostrando {transacoes.length} transação(ões)
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Nova Transação */}
      {mostrarModal && (
        <Modal onClose={() => setMostrarModal(false)} titulo="Nova Transação">
          <form onSubmit={criarTransacao} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CampoSelect
                label="Tipo"
                value={novaTransacao.tipo}
                onChange={(e) =>
                  setNovaTransacao({
                    ...novaTransacao,
                    tipo: e.target.value
                  })
                }
                options={[
                  { value: "entrada", label: "Entrada" },
                  { value: "saida", label: "Saída" }
                ]}
              />

              <CampoInput
                label="Valor *"
                type="number"
                value={novaTransacao.valor}
                onChange={(e) =>
                  setNovaTransacao({
                    ...novaTransacao,
                    valor: e.target.value
                  })
                }
                placeholder="0,00"
                required
              />
            </div>

            <CampoInput
              label="Categoria"
              value={novaTransacao.categoria}
              onChange={(e) =>
                setNovaTransacao({
                  ...novaTransacao,
                  categoria: e.target.value
                })
              }
              placeholder="Ex: venda, aluguel, fornecedor"
            />

            <CampoSelect
              label="Forma de pagamento"
              value={novaTransacao.formaPagamento}
              onChange={(e) =>
                setNovaTransacao({
                  ...novaTransacao,
                  formaPagamento: e.target.value
                })
              }
              options={[
                { value: "", label: "Selecione" },
                { value: "dinheiro", label: "Dinheiro" },
                { value: "pix", label: "Pix" },
                { value: "cartao_credito", label: "Cartão de crédito" },
                { value: "cartao_debito", label: "Cartão de débito" }
              ]}
            />

            <CampoInput
              label="Descrição"
              value={novaTransacao.descricao}
              onChange={(e) =>
                setNovaTransacao({
                  ...novaTransacao,
                  descricao: e.target.value
                })
              }
              placeholder="Descrição da movimentação"
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
                className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90"
              >
                Salvar Transação
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
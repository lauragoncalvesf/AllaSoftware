import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"

export default function ClienteFinanceiro() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/clientes/${id}/detalhes`)
      setDados(response.data)
    } catch (error) {
      console.error("Erro ao carregar financeiro do cliente:", error)
      setDados(null)
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  const formatarData = (data) => {
    if (!data) return "-"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  const formatarDataHora = (data) => {
    if (!data) return "-"
    return new Date(data).toLocaleString("pt-BR")
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="text-gray-600">Carregando financeiro do cliente...</p>
      </AppLayout>
    )
  }

  if (!dados || !dados.cliente) {
    return (
      <AppLayout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-[#2D2E47] mb-2">
            Cliente não encontrado
          </h1>

          <p className="text-gray-500 mb-4">
            Não foi possível carregar as informações financeiras.
          </p>

          <button
            onClick={() => navigate("/contas-receber")}
            className="bg-[#2F8AA3] text-white px-5 py-2.5 rounded-xl hover:opacity-90"
          >
            Voltar para contas a receber
          </button>
        </div>
      </AppLayout>
    )
  }

  const {
    cliente,
    resumo,
    contasReceber = [],
    pagamentos = [],
    historico = []
  } = dados

  const ultimoPagamento = pagamentos?.[0]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/contas-receber")}
              className="text-sm text-[#3E7996] hover:underline mb-2"
            >
              ← Voltar para contas a receber
            </button>

            <h1 className="text-3xl font-bold text-[#2D2E47]">
              Financeiro de {cliente.nome}
            </h1>

            <p className="text-gray-500 mt-1">
              Compras, serviços, contas, pagamentos e saldo em aberto.
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <ResumoCard titulo="Total Comprado" valor={formatarMoeda(resumo?.totalComprado)} />
          <ResumoCard titulo="Total Pago" valor={formatarMoeda(resumo?.totalPago)} />
          <ResumoCard titulo="Em Aberto" valor={formatarMoeda(resumo?.totalEmAberto)} />
          <ResumoCard titulo="Vencido" valor={formatarMoeda(resumo?.totalVencido)} />
          <ResumoCard
            titulo="Último Pagamento"
            valor={ultimoPagamento ? formatarData(ultimoPagamento.createdAt) : "-"}
          />
        </div>

        <div className="space-y-5">
          <h2 className="text-xl font-bold text-[#2D2E47]">
            Contas e compras por data
          </h2>

          {contasReceber.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-500">
              Nenhuma conta a receber encontrada para este cliente.
            </div>
          ) : (
            contasReceber.map((conta) => {
              const saldo = Number(conta.valorTotal || 0) - Number(conta.valorPago || 0)

              return (
                <div
                  key={conta.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#2D2E47]">
                        {conta.descricao || `Conta #${conta.id}`}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Vencimento: {conta.vencimento ? formatarData(conta.vencimento) : "Sem vencimento"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge texto={conta.status} />
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        Total: {formatarMoeda(conta.valorTotal)}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        Pago: {formatarMoeda(conta.valorPago)}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                        Saldo: {formatarMoeda(saldo)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#2D2E47] mb-3">
                        Compras/serviços desta conta
                      </h4>

                      {!conta.vendas || conta.vendas.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Nenhuma venda vinculada a esta conta.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {conta.vendas.map((venda) => (
                            <div
                              key={venda.id}
                              className="border border-gray-100 rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-[#2D2E47]">
                                    Venda #{venda.id}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatarDataHora(venda.createdAt)}
                                  </p>
                                </div>

                                <p className="font-semibold text-[#2D2E47]">
                                  {formatarMoeda(venda.totalFinal)}
                                </p>
                              </div>

                              <div className="mt-3 space-y-2">
                                {(venda.itens || []).map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-600">
                                      {item.nomeItem} • {item.quantidade}x
                                    </span>
                                    <span className="font-medium text-[#2D2E47]">
                                      {formatarMoeda(item.subtotal)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#2D2E47] mb-3">
                        Pagamentos desta conta
                      </h4>

                      {!conta.pagamentos || conta.pagamentos.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Nenhum pagamento registrado nessa conta.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {conta.pagamentos.map((pagamento) => (
                            <div
                              key={pagamento.id}
                              className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-3"
                            >
                              <div>
                                <p className="font-medium text-[#2D2E47]">
                                  {pagamento.descricao || `Pagamento #${pagamento.id}`}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatarFormaPagamento(pagamento.formaPagamento)} •{" "}
                                  {formatarDataHora(pagamento.createdAt)}
                                </p>
                              </div>

                              <p className="font-semibold text-emerald-600">
                                {formatarMoeda(pagamento.valor)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#2D2E47]">
              Histórico financeiro
            </h2>
          </div>

          {historico.length === 0 ? (
            <div className="p-6 text-gray-500">Nenhum histórico encontrado.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {historico.map((evento, index) => (
                <div
                  key={`${evento.tipo}-${index}-${evento.data}`}
                  className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-[#2D2E47]">
                      {evento.titulo}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {evento.descricao}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatarDataHora(evento.data)}
                    </p>
                  </div>

                  <div className="font-semibold text-[#2D2E47]">
                    {evento.valor !== null ? formatarMoeda(evento.valor) : "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function formatarFormaPagamento(forma) {
  const formas = {
    dinheiro: "Dinheiro",
    pix: "Pix",
    cartao_credito: "Cartão de crédito",
    cartao_debito: "Cartão de débito"
  }

  return formas[forma] || "Não informado"
}

function Badge({ texto }) {
  const estilos = {
    pendente: "bg-amber-100 text-amber-700",
    parcial: "bg-blue-100 text-blue-700",
    vencido: "bg-red-100 text-red-700",
    pago: "bg-emerald-100 text-emerald-700"
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        estilos[texto] || "bg-gray-100 text-gray-600"
      }`}
    >
      {texto}
    </span>
  )
}

function ResumoCard({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-[#2D2E47] mt-2">{valor}</p>
    </div>
  )
}
import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"

export default function Relatorio() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(false)

  const [tipo, setTipo] = useState("")
  const [categoria, setCategoria] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  useEffect(() => {
    carregarRelatorio()
  }, [])

  const carregarRelatorio = async () => {
    try {
      setLoading(true)

      const response = await api.get("/transacoes", {
        params: {
          status: "ativa"
        }
      })

      setTransacoes(response.data || [])
    } catch (error) {
      console.error("Erro ao carregar relatório:", error)
    } finally {
      setLoading(false)
    }
  }

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((transacao) => {
      const data = new Date(transacao.createdAt)

      if (tipo && transacao.tipo !== tipo) return false
      if (
        categoria &&
        !String(transacao.categoria || "")
          .toLowerCase()
          .includes(categoria.toLowerCase())
      ) {
        return false
      }

      if (dataInicio) {
        const inicio = new Date(dataInicio)
        inicio.setHours(0, 0, 0, 0)
        if (data < inicio) return false
      }

      if (dataFim) {
        const fim = new Date(dataFim)
        fim.setHours(23, 59, 59, 999)
        if (data > fim) return false
      }

      return true
    })
  }, [transacoes, tipo, categoria, dataInicio, dataFim])

  const resumo = useMemo(() => {
    const entradas = transacoesFiltradas
      .filter((t) => t.tipo === "entrada")
      .reduce((acc, t) => acc + Number(t.valor || 0), 0)

    const saidas = transacoesFiltradas
      .filter((t) => t.tipo === "saida")
      .reduce((acc, t) => acc + Number(t.valor || 0), 0)

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      total: transacoesFiltradas.length
    }
  }, [transacoesFiltradas])

  const limparFiltros = () => {
    setTipo("")
    setCategoria("")
    setDataInicio("")
    setDataFim("")
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
            Relatório Financeiro
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Analise entradas, saídas e saldo por período, categoria e tipo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard titulo="Entradas" valor={formatarMoeda(resumo.entradas)} />
          <ResumoCard titulo="Saídas" valor={formatarMoeda(resumo.saidas)} />
          <ResumoCard titulo="Saldo" valor={formatarMoeda(resumo.saldo)} />
          <ResumoCard titulo="Registros" valor={resumo.total} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-[#2D2E47] mb-4">
            Filtros do relatório
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <CampoSelect
              label="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              options={[
                { value: "", label: "Todos" },
                { value: "entrada", label: "Entrada" },
                { value: "saida", label: "Saída" }
              ]}
            />

            <CampoInput
              label="Categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ex: venda"
            />

            <CampoInput
              label="Data inicial"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />

            <CampoInput
              label="Data final"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />

            <div className="flex items-end">
              <button
                type="button"
                onClick={limparFiltros}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2D2E47]">
              Transações do relatório
            </h2>

            <p className="text-sm text-gray-500">
              {transacoesFiltradas.length} registro(s)
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">Carregando relatório...</div>
          ) : transacoesFiltradas.length === 0 ? (
            <div className="p-6 text-gray-500">
              Nenhuma transação encontrada para os filtros selecionados.
            </div>
          ) : (
            <>
              <div className="hidden xl:block">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-500 border-b border-gray-100">
                  <div className="col-span-3">Descrição</div>
                  <div className="col-span-2">Categoria</div>
                  <div className="col-span-2">Tipo</div>
                  <div className="col-span-2">Pagamento</div>
                  <div className="col-span-2">Data</div>
                  <div className="col-span-1 text-right">Valor</div>
                </div>

                {transacoesFiltradas.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="col-span-3">
                      <p className="font-semibold text-[#2D2E47]">
                        {transacao.descricao || "Sem descrição"}
                      </p>
                      <p className="text-sm text-gray-500">#{transacao.id}</p>
                    </div>

                    <div className="col-span-2 flex items-center text-sm text-gray-600">
                      {transacao.categoria || "Sem categoria"}
                    </div>

                    <div className="col-span-2 flex items-center">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          transacao.tipo === "entrada"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transacao.tipo === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center text-sm text-gray-600">
                      {formatarFormaPagamento(transacao.formaPagamento)}
                    </div>

                    <div className="col-span-2 flex items-center text-sm text-gray-600">
                      {formatarData(transacao.createdAt)}
                    </div>

                    <div className="col-span-1 flex items-center justify-end">
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
                ))}
              </div>

              <div className="xl:hidden p-4 space-y-4">
                {transacoesFiltradas.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="border border-gray-100 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#2D2E47]">
                          {transacao.descricao || "Sem descrição"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {transacao.categoria || "Sem categoria"} •{" "}
                          {formatarData(transacao.createdAt)}
                        </p>
                      </div>

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

                    <div className="mt-3 text-sm text-gray-500">
                      {transacao.tipo === "entrada" ? "Entrada" : "Saída"} •{" "}
                      {formatarFormaPagamento(transacao.formaPagamento)}
                    </div>
                  </div>
                ))}
              </div>
            </>
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

function ResumoCard({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-[#2D2E47] mt-2">{valor}</p>
    </div>
  )
}

function CampoInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2D2E47] mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
      />
    </div>
  )
}

function CampoSelect({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2D2E47] mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
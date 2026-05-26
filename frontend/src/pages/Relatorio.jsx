import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import {
  formatarMoeda,
  formatarData,
  formatarFormaPagamento
} from "../utils/formatters"
import ResumoCard from "../components/ResumoCard"
import CampoInput from "../components/CampoInput"
import CampoSelect from "../components/CampoSelect"
import PaginacaoLista from "../components/PaginacaoLista"

export default function Relatorio() {
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)

  const [tipo, setTipo] = useState("")
  const [categoria, setCategoria] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [paginaTransacoes, setPaginaTransacoes] = useState(1)
  const [transacoesPorPagina, setTransacoesPorPagina] = useState(10)
  const [paginaVendas, setPaginaVendas] = useState(1)
  const [vendasPorPagina, setVendasPorPagina] = useState(10)

  useEffect(() => {
    carregarRelatorio()
  }, [])

  const carregarRelatorio = async () => {
    try {
      setLoading(true)

      const response = await api.get("/relatorios/financeiro/dados", {
        params: {
          tipo,
          categoria,
          dataInicio,
          dataFim
        }
      })

      setDados(response.data)
    } catch (error) {
      console.error("Erro ao carregar relatório:", error)
    } finally {
      setLoading(false)
    }
  }

  const limparFiltros = async () => {
    setTipo("")
    setCategoria("")
    setDataInicio("")
    setDataFim("")
    setPaginaTransacoes(1)
    setPaginaVendas(1)

    try {
      setLoading(true)

      const response = await api.get("/relatorios/financeiro/dados")
      setDados(response.data)
    } catch (error) {
      console.error("Erro ao limpar filtros:", error)
    } finally {
      setLoading(false)
    }
  }

  const resumo = dados?.resumo || {}
  const transacoes = useMemo(() => dados?.transacoes || [], [dados?.transacoes])
  const vendas = useMemo(() => dados?.vendas || [], [dados?.vendas])

  const transacoesPaginadas = useMemo(() => {
    const inicio = (paginaTransacoes - 1) * transacoesPorPagina
    return transacoes.slice(inicio, inicio + transacoesPorPagina)
  }, [transacoes, paginaTransacoes, transacoesPorPagina])

  const vendasPaginadas = useMemo(() => {
    const inicio = (paginaVendas - 1) * vendasPorPagina
    return vendas.slice(inicio, inicio + vendasPorPagina)
  }, [vendas, paginaVendas, vendasPorPagina])

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(transacoes.length / transacoesPorPagina))
    if (paginaTransacoes > totalPaginas) {
      setPaginaTransacoes(totalPaginas)
    }
  }, [transacoes.length, transacoesPorPagina, paginaTransacoes])

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(vendas.length / vendasPorPagina))
    if (paginaVendas > totalPaginas) {
      setPaginaVendas(totalPaginas)
    }
  }, [vendas.length, vendasPorPagina, paginaVendas])

  const alterarTransacoesPorPagina = (valor) => {
    setTransacoesPorPagina(valor)
    setPaginaTransacoes(1)
  }

  const alterarVendasPorPagina = (valor) => {
    setVendasPorPagina(valor)
    setPaginaVendas(1)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
            Relatório Financeiro
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Analise caixa, vendas, custos e lucro bruto por período.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard
            titulo="Entradas"
            valor={formatarMoeda(resumo.entradas)}
          />

          <ResumoCard
            titulo="Saídas"
            valor={formatarMoeda(resumo.saidas)}
          />

          <ResumoCard
            titulo="Saldo de Caixa"
            valor={formatarMoeda(resumo.saldoCaixa)}
          />

          <ResumoCard
            titulo="Em Aberto"
            valor={formatarMoeda(resumo.totalEmAberto)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard
            titulo="Faturamento Vendas"
            valor={formatarMoeda(resumo.faturamentoVendas)}
          />

          <ResumoCard
            titulo="Custo Produtos"
            valor={formatarMoeda(resumo.custoProdutosVendidos)}
          />

          <ResumoCard
            titulo="Lucro Bruto Vendas"
            valor={formatarMoeda(resumo.lucroBrutoVendas)}
          />

          <ResumoCard
            titulo="Vendas"
            valor={resumo.quantidadeVendas || 0}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-[#2D2E47] mb-4">
            Filtros do relatório
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
              placeholder="Ex: Venda"
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
                onClick={() => {
                  setPaginaTransacoes(1)
                  setPaginaVendas(1)
                  carregarRelatorio()
                }}
                className="w-full px-4 py-3 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90"
              >
                Aplicar
              </button>
            </div>

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
              {transacoes.length} registro(s)
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">
              Carregando relatório...
            </div>
          ) : transacoes.length === 0 ? (
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

                {transacoesPaginadas.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="col-span-3">
                      <p className="font-semibold text-[#2D2E47]">
                        {transacao.descricao || "Sem descrição"}
                      </p>
                      <p className="text-sm text-gray-500">
                        #{transacao.id}
                      </p>
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
                {transacoesPaginadas.map((transacao) => (
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

              <PaginacaoLista
                total={transacoes.length}
                pagina={paginaTransacoes}
                porPagina={transacoesPorPagina}
                onPaginaChange={setPaginaTransacoes}
                onPorPaginaChange={alterarTransacoesPorPagina}
                rotulo="transação(ões)"
              />
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2D2E47]">
              Vendas do período
            </h2>

            <p className="text-sm text-gray-500">
              {vendas.length} venda(s)
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">
              Carregando vendas...
            </div>
          ) : vendas.length === 0 ? (
            <div className="p-6 text-gray-500">
              Nenhuma venda encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {vendasPaginadas.map((venda) => (
                <div
                  key={venda.id}
                  className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-[#2D2E47]">
                      Venda #{venda.id}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {formatarData(venda.createdAt)} •{" "}
                      {venda.itens?.length || 0} item(ns)
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="font-semibold text-[#2D2E47]">
                      {formatarMoeda(venda.totalFinal)}
                    </p>

                    <p className="text-xs text-gray-500">
                      Total da venda
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && vendas.length > 0 && (
            <PaginacaoLista
              total={vendas.length}
              pagina={paginaVendas}
              porPagina={vendasPorPagina}
              onPaginaChange={setPaginaVendas}
              onPorPaginaChange={alterarVendasPorPagina}
              rotulo="venda(s)"
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}

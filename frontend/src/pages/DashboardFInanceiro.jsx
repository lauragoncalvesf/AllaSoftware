import { useEffect, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts"
import { formatarMoeda, formatarFormaPagamento } from "../utils/formatters"
import ResumoCard from "../components/ResumoCard"

export default function DashboardFinanceiro() {
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const response = await api.get("/dashboard/financeiro")
      setDados(response.data)
    } catch (error) {
      console.error("Erro ao carregar dashboard financeiro:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatarDataCurta = (data) => {
    if (!data) return "-"
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit"
    })
  }

  const grafico7Dias = (dados?.grafico7Dias || []).map((item) => ({
    ...item,
    diaFormatado: formatarDataCurta(item.dia)
  }))

  const formasPagamento = Object.entries(dados?.formasPagamento || {}).map(
    ([nome, valor]) => ({
      nome: formatarFormaPagamento(nome),
      valor
    })
  )

  if (loading) {
    return (
      <AppLayout>
        <p className="text-gray-600">Carregando dashboard financeiro...</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
            Dashboard Financeiro
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe entradas, saídas, lucro, cobranças e formas de pagamento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResumoCard
            titulo="Lucro Hoje"
            valor={formatarMoeda(dados?.hoje?.lucro)}
            subtitulo="Resultado do dia"
            corIcone="bg-blue-100 text-blue-600"
          />

          <ResumoCard
            titulo="Lucro 7 Dias"
            valor={formatarMoeda(dados?.seteDias?.lucro)}
            subtitulo="Resultado semanal"
            corIcone="bg-emerald-100 text-emerald-600"
          />

          <ResumoCard
            titulo="Lucro do Mês"
            valor={formatarMoeda(dados?.mes?.lucro)}
            subtitulo="Resultado mensal"
            corIcone="bg-violet-100 text-violet-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResumoCard
            titulo="Entradas do Mês"
            valor={formatarMoeda(dados?.mes?.entradas)}
            subtitulo="Receitas ativas"
            corIcone="bg-emerald-100 text-emerald-600"
          />

          <ResumoCard
            titulo="Saídas do Mês"
            valor={formatarMoeda(dados?.mes?.saidas)}
            subtitulo="Despesas ativas"
            corIcone="bg-red-100 text-red-600"
          />

          <ResumoCard
            titulo="Total em Aberto"
            valor={formatarMoeda(dados?.totalEmAberto)}
            subtitulo="Contas pendentes"
            corIcone="bg-amber-100 text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GraficoCard titulo="Entradas x Saídas - últimos 7 dias">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={grafico7Dias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="diaFormatado" />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Area
                  type="monotone"
                  dataKey="entradas"
                  name="Entradas"
                  stroke="#00BAB4"
                  fill="#00BAB4"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="saidas"
                  name="Saídas"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GraficoCard>

          <GraficoCard titulo="Formas de pagamento - mês atual">
            {formasPagamento.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Nenhum dado de pagamento no mês.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formasPagamento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatarMoeda(value)} />
                  <Bar dataKey="valor" name="Valor" fill="#2F8AA3" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GraficoCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#2D2E47]">
                Últimas Transações
              </h2>
            </div>

            {(dados?.ultimasTransacoes || []).length === 0 ? (
              <div className="p-6 text-gray-500">Nenhuma transação encontrada.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dados.ultimasTransacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-[#2D2E47]">
                        {transacao.descricao || "Sem descrição"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {transacao.categoria || "Sem categoria"} •{" "}
                        {formatarFormaPagamento(transacao.formaPagamento)}
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
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-[#2D2E47] mb-4">
              Cobranças
            </h2>

            <InfoLinha label="Pendentes" valor={dados?.contasPendentes || 0} />
            <InfoLinha label="Parciais" valor={dados?.contasParciais || 0} />
            <InfoLinha label="Pagas" valor={dados?.contasPagas || 0} />
            <InfoLinha label="Vencidas" valor={dados?.contasVencidas || 0} />
            <InfoLinha
              label="Total Vencido"
              valor={formatarMoeda(dados?.totalVencido)}
              destaque
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function GraficoCard({ titulo, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-lg font-semibold text-[#2D2E47] mb-4">
        {titulo}
      </h2>
      {children}
    </div>
  )
}

function InfoLinha({ label, valor, destaque = false }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`font-semibold ${
          destaque ? "text-red-600" : "text-[#2D2E47]"
        }`}
      >
        {valor}
      </span>
    </div>
  )
}
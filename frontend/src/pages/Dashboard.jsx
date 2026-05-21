import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import { formatarMoeda } from "../utils/formatters"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

/**
 * Dashboard principal – versão compacta e organizada.
 * Mantém a ideia de KPIs + gráfico, mas com hierarquia clara,
 * cards densos e seções agrupadas por contexto.
 */
export default function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null")
  const [dados, setDados] = useState(null)
  const [comissao, setComissao] = useState(null)
  const [serie, setSerie] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const reqs = [
          api.get("/clientes"),
          api.get("/dashboard/cobrancas"),
          api.get("/dashboard/vendas-serie").catch(() => ({ data: [] })),
        ]
        if (usuario?.id) reqs.push(api.get("/comissoes/me"))

        const [clientesRes, cobrancasRes, serieRes, comissaoRes] =
          await Promise.all(reqs)

        const clientes = clientesRes.data || []
        const cobrancas = cobrancasRes.data || {}

        setDados({
          totalClientes: clientes.length,
          clientesPendentes: clientes.filter((c) => c.status === "pendente").length,
          contasPendentes: cobrancas.contasPendentes || 0,
          contasVencidas: cobrancas.contasVencidas || 0,
          totalEmAberto: cobrancas.totalEmAberto || 0,
          totalVencido: cobrancas.totalVencido || 0,
        })
        setSerie(serieRes?.data || [])
        if (comissaoRes?.data) setComissao(comissaoRes.data)
      } catch (e) {
        console.error("Erro ao carregar dashboard principal:", e)
      } finally {
        setLoading(false)
      }
    }
    carregarResumo()
  }, [])

  const primeiroNome = useMemo(
    () => (usuario?.nome || "").split(" ")[0],
    [usuario]
  )

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header enxuto */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[#2D2E47]">
            Olá, {primeiroNome || "bem-vinda"} 👋
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Visão rápida do seu dia • Perfil:{" "}
            <span className="font-medium text-gray-700">{usuario?.role}</span>
          </p>
        </div>

        {comissao && (
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-[11px] uppercase tracking-wide text-gray-400">
              Comissão do mês
            </span>
            <span className="text-base font-bold text-emerald-600">
              {formatarMoeda(comissao?.totais?.comissaoTotal)}
            </span>
          </div>
        )}
      </div>

      {/* KPIs compactos — operação */}
      <SectionTitle>Operação</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiMini
          label="Clientes"
          value={dados?.totalClientes || 0}
          hint={`${dados?.clientesPendentes || 0} pendentes`}
          accent="indigo"
        />
        <KpiMini
          label="Contas pendentes"
          value={dados?.contasPendentes || 0}
          hint="Aguardando pagamento"
          accent="sky"
        />
        <KpiMini
          label="Contas vencidas"
          value={dados?.contasVencidas || 0}
          hint="Atenção"
          accent="red"
        />
        {comissao && (
          <KpiMini
            label="Itens comissionados"
            value={comissao?.itens?.length || 0}
            hint={`Vendido: ${formatarMoeda(comissao?.totais?.totalVendido)}`}
            accent="emerald"
          />
        )}
      </div>

      {/* Financeiro resumido */}
      <SectionTitle className="mt-6">Cobranças</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <KpiInline
          label="Total em aberto"
          value={formatarMoeda(dados?.totalEmAberto)}
          tone="neutral"
        />
        <KpiInline
          label="Total vencido"
          value={formatarMoeda(dados?.totalVencido)}
          tone="danger"
        />
      </div>

      {/* Gráfico */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#2D2E47]">
            Vendas — últimos dias
          </h2>
          <span className="text-[11px] text-gray-400">Atualizado agora</span>
        </div>
        <div className="px-2 pb-3 pt-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={serie}>
              <defs>
                <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F8AA3" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2F8AA3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} width={48} />
              <Tooltip
                formatter={(v) => formatarMoeda(v)}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#2F8AA3"
                strokeWidth={2}
                fill="url(#gradVendas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  )
}

/* ---------- Subcomponentes ---------- */

function SectionTitle({ children, className = "" }) {
  return (
    <h3
      className={`text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 ${className}`}
    >
      {children}
    </h3>
  )
}

const ACCENTS = {
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  red: "bg-red-50 text-red-600",
  emerald: "bg-emerald-50 text-emerald-600",
}

function KpiMini({ label, value, hint, accent = "indigo" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <span className={`h-2 w-2 rounded-full ${ACCENTS[accent].split(" ")[0]}`} />
      </div>
      <span className="text-xl font-bold text-[#2D2E47] mt-1 leading-tight">
        {value}
      </span>
      {hint && <span className="text-[11px] text-gray-500 mt-0.5">{hint}</span>}
    </div>
  )
}

function KpiInline({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "danger" ? "text-red-600" : "text-[#2D2E47]"
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-base font-semibold ${toneClass}`}>{value}</span>
    </div>
  )
}

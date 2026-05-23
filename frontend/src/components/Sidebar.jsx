import { useNavigate, useLocation } from "react-router-dom"
import {
  CalendarDays,
  ChartColumn,
  DollarSign,
  FileText,
  HandHeart,
  LayoutDashboard,
  Package,
  BadgeDollarSign,
  ShoppingCart,
  Users
} from "lucide-react"
import { podeAcessar } from "../utils/permissoes"
import BrandLogo from "./BrandLogo"

export default function Sidebar({ aberta = true, setAberta }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const getNavButtonClass = (path) => {
    const baseClass =
      "w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm flex items-center gap-3"

    return isActive(path)
      ? `${baseClass} bg-[#3E7996] text-white font-semibold shadow-sm`
      : `${baseClass} text-white/85 hover:bg-white/10 hover:text-white`
  }

  if (!aberta) {
    return (
      <aside className="fixed left-0 top-0 w-14 h-screen bg-[#2D2E47] text-white flex flex-col items-center py-4 z-40">
        <button
          type="button"
          onClick={() => setAberta(true)}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          title="Abrir menu"
        >
          ☰
        </button>

        <div className="mt-6">
          <BrandLogo variant="icon" className="h-9 w-9" />
        </div>
      </aside>
    )
  }

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#2D2E47] text-white flex flex-col overflow-y-auto z-40 transition-all duration-300">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <BrandLogo tone="light" className="h-10 w-40 object-left" />

            <p className="text-xs text-white/45 mt-1">
              Gestão inteligente
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAberta(false)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition"
            title="Recolher menu"
          >
            ‹
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">

        {podeAcessar("dashboard") && (
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className={getNavButtonClass("/dashboard")}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>
        )}

        {podeAcessar("clientes") && (
        <button
          type="button"
          onClick={() => navigate("/clientes")}
          className={getNavButtonClass("/clientes")}
        >
            <Users className="h-4 w-4" />
          Clientes
        </button>
        )}

        {podeAcessar("servicos") && (
        <button
          type="button"
          onClick={() => navigate("/servicos")}
          className={getNavButtonClass("/servicos")}
        >
          <HandHeart className="h-4 w-4" />
          <span>Serviços</span>
        </button>
        )}

        {podeAcessar("produtos") && (
        <button
          type="button"
          onClick={() => navigate("/produtos")}
          className={getNavButtonClass("/produtos")}
        >
          <Package className="h-4 w-4" />
          <span>Produtos</span>
        </button>
        )}

        {podeAcessar("vendas") && (
        <button
          type="button"
          onClick={() => navigate("/vendas")}
          className={getNavButtonClass("/vendas")}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Vendas</span>
        </button>
        )}

        {podeAcessar("contasReceber") && (
        <button
          type="button"
          onClick={() => navigate("/contas-receber")}
          className={getNavButtonClass("/contas-receber")}
        >
          <BadgeDollarSign className="h-4 w-4" />
          <span>Contas a Receber</span>
        </button>
        )}

        {podeAcessar("agendamentos") && (
          <button
            type="button"
            onClick={() => navigate("/agendamentos")}
            className={getNavButtonClass("/agendamentos")}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Agendamentos</span>
          </button>
        )}

        {(podeAcessar("financeiro") || podeAcessar("relatorios")) && (
          <div className="pt-3 mt-3 border-t border-white/10">
          <p className="px-4 text-[11px] uppercase tracking-wide text-white/40 mb-2">
             Administração
          </p>

          <div className="space-y-2">

          {podeAcessar("financeiro") && (
            <button
              type="button"
              onClick={() => navigate("/transacoes")}
              className={getNavButtonClass("/transacoes")}
            >
                <DollarSign className="h-4 w-4" />
                <span>Financeiro</span>
              </button>
          )}

          {podeAcessar("relatorios") && (
              <button
                type="button"
                onClick={() => navigate("/financeiro/dashboard")}
                className={getNavButtonClass("/financeiro/dashboard")}
              >
                <ChartColumn className="h-4 w-4" />
                <span>Dashboard Financeiro</span>
              </button>
          )}

          {podeAcessar("relatorios") && (
              <button
                type="button"
                onClick={() => navigate("/relatorios/financeiro")}
                className={getNavButtonClass("/relatorios/financeiro")}
              >
                <FileText className="h-4 w-4" />
                <span>Relatórios</span>
              </button>
          )}
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}

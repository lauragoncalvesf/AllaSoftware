import { useNavigate, useLocation } from "react-router-dom"

export default function Sidebar({ aberta = true, setAberta }) {
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = JSON.parse(localStorage.getItem("usuario"))

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    navigate("/")
  }

  const nomeUsuario = usuario?.nome || "Usuário"
  const inicialUsuario = nomeUsuario.charAt(0).toUpperCase()

  const perfilUsuario =
    usuario?.role === "admin"
      ? "Admin"
      : usuario?.role === "funcionario"
      ? "Funcionário"
      : "Empresa"

  const isActive = (path) => location.pathname === path

  const getNavButtonClass = (path) => {
    const baseClass =
      "w-full text-left px-4 py-2.5 rounded-xl transition-colors text-sm"

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

        <button
          type="button"
          onClick={() => navigate("/perfil")}
          className="w-10 h-10 rounded-full bg-white text-[#2F8AA3] flex items-center justify-center text-sm font-bold shadow-sm mt-4"
          title={nomeUsuario}
        >
          {inicialUsuario || "U"}
        </button>
      </aside>
    )
  }

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#2D2E47] text-white flex flex-col overflow-y-auto z-40 transition-all duration-300">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">
              Sistema ALLA
            </h1>
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

        <button
          type="button"
          onClick={() => navigate("/perfil")}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition text-left ${
            isActive("/perfil")
              ? "bg-[#3E7996] shadow-sm"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-white text-[#2F8AA3] flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
            {inicialUsuario || "U"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {nomeUsuario}
            </p>

            <p className="text-[11px] text-white/55 truncate">
              {perfilUsuario}
            </p>
          </div>

          <span className="text-white/35 text-sm">
            ›
          </span>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className={getNavButtonClass("/dashboard")}
        >
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => navigate("/clientes")}
          className={getNavButtonClass("/clientes")}
        >
          Clientes
        </button>

        <button
          type="button"
          onClick={() => navigate("/servicos")}
          className={getNavButtonClass("/servicos")}
        >
          Serviços
        </button>

        <button
          type="button"
          onClick={() => navigate("/produtos")}
          className={getNavButtonClass("/produtos")}
        >
          Produtos
        </button>

        <button
          type="button"
          onClick={() => navigate("/vendas")}
          className={getNavButtonClass("/vendas")}
        >
          Vendas
        </button>

        <button
          type="button"
          onClick={() => navigate("/contas-receber")}
          className={getNavButtonClass("/contas-receber")}
        >
          Contas a Receber
        </button>

        <button
          type="button"
          onClick={() => navigate("/agendamentos")}
          className={getNavButtonClass("/agendamentos")}
        >
          Agendamentos
        </button>

        {usuario?.role === "admin" && (
          <div className="pt-3 mt-3 border-t border-white/10">
            <p className="px-4 text-[11px] uppercase tracking-wide text-white/40 mb-2">
              Administração
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate("/transacoes")}
                className={getNavButtonClass("/transacoes")}
              >
                Financeiro
              </button>

              <button
                type="button"
                onClick={() => navigate("/financeiro/dashboard")}
                className={getNavButtonClass("/financeiro/dashboard")}
              >
                Dashboard Financeiro
              </button>

              <button
                type="button"
                onClick={() => navigate("/usuarios")}
                className={getNavButtonClass("/usuarios")}
              >
                Usuários
              </button>

              <button
                type="button"
                onClick={() => navigate("/relatorios/financeiro")}
                className={getNavButtonClass("/relatorios/financeiro")}
              >
                Relatórios
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={logout}
          className="w-full bg-[#3E7996] py-2.5 rounded-xl hover:opacity-90 text-sm font-medium"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
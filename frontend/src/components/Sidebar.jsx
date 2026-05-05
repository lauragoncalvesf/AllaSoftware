import { useNavigate, useLocation } from "react-router-dom"

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = JSON.parse(localStorage.getItem("usuario"))

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    navigate("/")
  }

  // Função para verificar se é rota ativa
  const isActive = (path) => location.pathname === path

  // Função para retornar classe de estilo baseado se está ativo
  const getNavButtonClass = (path) => {
    const baseClass = "w-full text-left px-4 py-2 rounded-lg transition-colors"
    return isActive(path)
      ? `${baseClass} bg-[#3E7996] text-white font-semibold`
      : `${baseClass} hover:bg-white/10`
  }

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#2D2E47] text-white flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">Sistema ALLA</h1>
        <p className="text-sm text-white/70 mt-2">{usuario?.nome}</p>
        <p className="text-xs text-white/50">Perfil: {usuario?.role}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => navigate("/dashboard")}
          className={getNavButtonClass("/dashboard")}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/clientes")}
          className={getNavButtonClass("/clientes")}
        >
          Clientes
        </button>

        <button
          onClick={() => navigate("/servicos")}
          className={getNavButtonClass("/servicos")}
        >
          Serviços
        </button>

        <button
          onClick={() => navigate("/produtos")}
          className={getNavButtonClass("/produtos")}
        >
          Produtos
        </button>

        <button
          onClick={() => navigate("/vendas")}
          className={getNavButtonClass("/vendas")}
        >
          Vendas
        </button>

        <button
          onClick={() => navigate("/contas-receber")}
          className={getNavButtonClass("/contas-receber")}
        >
          Contas a Receber
        </button>

        <button
          onClick={() => navigate("/agendamentos")}
          className={getNavButtonClass("/agendamentos")}
        >
          Agendamentos
        </button>

        {usuario?.role === "admin" && (
          <>
            <button
              onClick={() => navigate("/transacoes")}
              className={getNavButtonClass("/transacoes")}
            >
              Financeiro
            </button>

            <button
              onClick={() => navigate("/financeiro/dashboard")}
              className={getNavButtonClass("/financeiro/dashboard")}
            >
              Dashboard Financeiro
            </button>

            <button
              onClick={() => navigate("/usuarios")}
              className={getNavButtonClass("/usuarios")}
            >
              Usuários
            </button>

            <button
              onClick={() => navigate("/relatorios/financeiro")}
              className={getNavButtonClass("/relatorios/financeiro")}
            >
              Relatórios
            </button>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full bg-[#3E7996] py-2 rounded-lg hover:opacity-90"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
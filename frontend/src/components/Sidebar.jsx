import { useNavigate } from "react-router-dom"

export default function Sidebar() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem("usuario"))

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    navigate("/")
  }

  return (
    <aside className="w-64 min-h-screen bg-[#2D2E47] text-white flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">Sistema SaaS</h1>
        <p className="text-sm text-white/70 mt-2">{usuario?.nome}</p>
        <p className="text-xs text-white/50">Perfil: {usuario?.role}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/clientes")}
          className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Clientes
        </button>

        <button
        onClick={() => navigate("/servicos")}
        className="w-full text-left px-4 py-2 rouded-lg hover:bg-white/10"
        >
          Serviços
        </button>

        <button
        onClick={() => navigate("/produtos")}
        className="w-full text-left px-4 py-2 rouded-lg hover:bg-white/10"
        >
          Produtos
        </button>

        <button
          onClick={() => navigate("/vendas")}
          className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Vendas
        </button>

        <button
          onClick={() => navigate("/contas-receber")}
          className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Contas a Receber
        </button>

        {usuario?.role === "admin" && (
          <>
            <button
              onClick={() => navigate("/transacoes")}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Financeiro
            </button>

            <button
              onClick={() => navigate("/financeiro/dashboard")}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Dashboard FInanceiro
            </button>

            <button
              onClick={() => navigate("/usuarios")}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Usuários
            </button>

            <button
              onClick={() => navigate("/relatorios/financeiro")}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
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
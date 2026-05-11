import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"

export default function AppLayout({ children }) {
  const navigate = useNavigate()
  const [sidebarAberta, setSidebarAberta] = useState(true)
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)

  const usuario = JSON.parse(localStorage.getItem("usuario"))

  const nomeUsuario = usuario?.nome || "Usuário"
  const emailUsuario = usuario?.email || "Email não informado"

  const perfilUsuario =
    usuario?.role === "admin"
      ? "Administrador(a)"
      : usuario?.role === "funcionario"
      ? "Funcionário(a)"
      : "Empresa"

  const inicialUsuario = nomeUsuario.charAt(0).toUpperCase()

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        aberta={sidebarAberta}
        setAberta={setSidebarAberta}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarAberta ? "ml-64" : "ml-14"
        }`}
      >
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <p className="text-sm text-gray-400">
              Sistema ALLA
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#2D2E47] leading-tight">
                  {nomeUsuario}
                </p>
                <p className="text-xs text-gray-400">
                  {perfilUsuario}
                </p>
              </div>

              <div className="w-9 h-9 rounded-full bg-[#2F8AA3] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                {inicialUsuario || "U"}
              </div>

              <span className="text-gray-400 text-sm">
                {menuPerfilAberto ? "▲" : "▼"}
              </span>
            </button>

            {menuPerfilAberto && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="bg-[#2F8AA3] p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white text-[#2F8AA3] flex items-center justify-center text-lg font-bold shadow-sm">
                      {inicialUsuario || "U"}
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold truncate">
                        {nomeUsuario}
                      </p>
                      <p className="text-xs text-white/80 truncate">
                        {perfilUsuario}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 mt-3 truncate">
                    {emailUsuario}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuPerfilAberto(false)
                      navigate("/perfil")
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-[#2D2E47] hover:bg-gray-50 transition"
                  >
                    Minha conta
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
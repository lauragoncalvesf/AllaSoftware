import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import BrandLogo from "../components/BrandLogo"
import api from "../services/api"
import { podeAcessar } from "../utils/permissoes"

export default function AppLayout({ children }) {
  const navigate = useNavigate()
  const [sidebarAberta, setSidebarAberta] = useState(true)
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const [menuAjustesAberto, setMenuAjustesAberto] = useState(false)
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario"))
    } catch {
      return null
    }
  })

  useEffect(() => {
    const atualizarUsuarioLogado = async () => {
      try {
        const res = await api.get("/perfil")

        if (res.data?.tipo === "usuario") {
          const usuarioAtualizado = {
            id: res.data.id,
            nome: res.data.nome,
            email: res.data.email,
            role: res.data.role,
            cargo: res.data.cargo,
            status: res.data.status,
            permissoes: res.data.permissoes,
            tipoEquipe: res.data.tipoEquipe,
            profissional: res.data.profissional,
            preSelecionarAgendamento: res.data.preSelecionarAgendamento,
            empresaId: res.data.empresa?.id
          }

          localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado))
          setUsuario(usuarioAtualizado)
        }
      } catch (error) {
        console.error("Erro ao atualizar usuario logado:", error)
      }
    }

    atualizarUsuarioLogado()
    window.addEventListener("focus", atualizarUsuarioLogado)

    return () => {
      window.removeEventListener("focus", atualizarUsuarioLogado)
    }
  }, [])

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

  const irPara = (rota) => {
    setMenuPerfilAberto(false)
    setMenuAjustesAberto(false)
    navigate(rota)
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
          <div className="flex items-center">
            <BrandLogo tone="dark" className="h-9 w-40 object-left" />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMenuPerfilAberto(!menuPerfilAberto)
                  setMenuAjustesAberto(false)
                }}
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
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

                    {(podeAcessar("usuarios") || podeAcessar("comissoes")) && (
                      <button
                        type="button"
                        onClick={() => setMenuAjustesAberto(!menuAjustesAberto)}
                        className="h-9 w-9 shrink-0 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition"
                        title="Ajustes"
                        aria-label="Ajustes"
                      >
                        <SettingsIcon />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-white/80 mt-3 truncate">
                    {emailUsuario}
                  </p>
                </div>

                <div className="p-2">
                  {menuAjustesAberto && (
                    <div className="mb-2 border-b border-gray-100 pb-2">
                      <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Ajustes
                      </p>

                      {podeAcessar("usuarios") && (
                        <button
                          type="button"
                          onClick={() => irPara("/equipe")}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-[#2D2E47] hover:bg-gray-50 transition"
                        >
                          Equipe
                        </button>
                      )}

                      {podeAcessar("comissoes") && (
                        <button
                          type="button"
                          onClick={() => irPara("/comissoes")}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-[#2D2E47] hover:bg-gray-50 transition"
                        >
                          Comissões
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => irPara("/perfil")}
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
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.37a1.7 1.7 0 0 0-1 .16 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1-.16 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-.16-1 1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0 .16-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-.16 1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1 .16 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.37 9c.07.35.07.68 0 1a1.7 1.7 0 0 0 .16 1 1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
    </svg>
  )
}

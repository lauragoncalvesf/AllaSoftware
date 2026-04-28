import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import api from "../services/api"

export default function ResetarSenha() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-red-600">Erro</h1>
          <p className="text-center text-gray-600 mt-4">
            Link de recuperação inválido ou expirado
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full mt-6 bg-[#3E7996] text-white py-3 rounded-lg font-medium hover:opacity-90"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (novaSenha.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      return
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não conferem")
      return
    }

    setLoading(true)

    try {
      const response = await api.post("/resetar-senha", {
        token,
        novaSenha
      })
      setMessage(response.data.message)
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao resetar senha")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center text-[#2D2E47] mb-6">
          Criar Nova Senha
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            ✅ {message}
            <p className="text-xs mt-2">Redirecionando...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Nova Senha</label>
          <input
            type="password"
            placeholder="Digite sua nova senha"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">
            Confirmar Senha
          </label>
          <input
            type="password"
            placeholder="Confirme sua nova senha"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3E7996] text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Resetando..." : "Resetar Senha"}
        </button>
      </form>
    </div>
  )
}

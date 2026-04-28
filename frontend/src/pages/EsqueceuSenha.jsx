import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await api.post("/esqueceu-senha", { email })
      setMessage(response.data.message)
      setEmail("")
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao solicitar recuperação")
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
        <h1 className="text-2xl font-bold text-center text-[#2D2E47] mb-2">
          Recuperar Senha
        </h1>
        <p className="text-sm text-center text-gray-600 mb-6">
          Digite seu email para receber um link de recuperação
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            placeholder="Digite seu email"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3E7996] text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar Link"}
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Lembrou a senha?{" "}
          <Link
            to="/"
            className="text-[#3E7996] font-medium hover:underline"
          >
            Voltar ao login
          </Link>
        </p>
      </form>
    </div>
  )
}

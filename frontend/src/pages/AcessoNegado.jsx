import { useNavigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"

export default function AcessoNegado() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-xl">
        <h1 className="text-2xl font-bold text-[#2D2E47]">
          Acesso negado
        </h1>

        <p className="text-gray-500 mt-2">
          Você não tem permissão para acessar esta área do sistema.
        </p>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90"
        >
          Voltar para o dashboard
        </button>
      </div>
    </AppLayout>
  )
}
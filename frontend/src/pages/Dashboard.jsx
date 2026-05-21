import { useEffect, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import { formatarMoeda } from "../utils/formatters"

export default function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario"))
  const [dados, setDados] = useState(null)
  const [comissao, setComissao] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const requisicoes = [
          api.get("/clientes"),
          api.get("/dashboard/cobrancas")
        ]

        if (usuario?.id) {
          requisicoes.push(api.get("/comissoes/me"))
        }

        const [clientesRes, cobrancasRes, comissaoRes] = await Promise.all(requisicoes)

        const clientes = clientesRes.data || []
        const cobrancas = cobrancasRes.data || {}

        const clientesPendentes = clientes.filter(
          (cliente) => cliente.status === "pendente"
        ).length

        setDados({
          totalClientes: clientes.length,
          clientesPendentes,
          contasPendentes: cobrancas.contasPendentes || 0,
          contasVencidas: cobrancas.contasVencidas || 0,
          totalEmAberto: cobrancas.totalEmAberto || 0,
          totalVencido: cobrancas.totalVencido || 0
        })

        if (comissaoRes?.data) {
          setComissao(comissaoRes.data)
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard principal:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarResumo()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <p className="text-gray-600">Carregando dashboard...</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-[#2D2E47]">
        Bem-vinda, {usuario?.nome} 
      </h1>

      <p className="text-gray-600 mt-2">
        Perfil: {usuario?.role}
      </p>

      {usuario?.id && comissao && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl shadow p-5 border border-emerald-100">
            <h2 className="text-sm text-gray-500">Vendido no mes</h2>
            <p className="text-2xl font-bold text-[#2D2E47] mt-2">
              {formatarMoeda(comissao?.totais?.totalVendido)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 border border-emerald-100">
            <h2 className="text-sm text-gray-500">Comissao do mes</h2>
            <p className="text-2xl font-bold text-emerald-700 mt-2">
              {formatarMoeda(comissao?.totais?.comissaoTotal)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 border border-emerald-100">
            <h2 className="text-sm text-gray-500">Itens comissionados</h2>
            <p className="text-2xl font-bold text-[#3E7996] mt-2">
              {comissao?.itens?.length || 0}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-sm text-gray-500">Total de Clientes</h2>
          <p className="text-2xl font-bold text-[#2D2E47] mt-2">
            {dados?.totalClientes || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-sm text-gray-500">Clientes Pendentes</h2>
          <p className="text-2xl font-bold text-[#3E7996] mt-2">
            {dados?.clientesPendentes || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-sm text-gray-500">Contas Pendentes</h2>
          <p className="text-2xl font-bold text-[#2D2E47] mt-2">
            {dados?.contasPendentes || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-sm text-gray-500">Contas Vencidas</h2>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {dados?.contasVencidas || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-sm text-gray-500">Total em Aberto</h2>
          <p className="text-2xl font-bold text-[#3E7996] mt-2">
            {formatarMoeda(dados?.totalEmAberto)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-sm text-gray-500">Total Vencido</h2>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {formatarMoeda(dados?.totalVencido)}
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

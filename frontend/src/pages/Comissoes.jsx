import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import { formatarData, formatarMoeda } from "../utils/formatters"
import ResumoCard from "../components/ResumoCard"

const hoje = new Date()
const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

const formatarInputData = (data) => data.toISOString().slice(0, 10)

export default function Comissoes() {
  const [dataInicio, setDataInicio] = useState(formatarInputData(inicioMes))
  const [dataFim, setDataFim] = useState(formatarInputData(hoje))
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [funcionarioAberto, setFuncionarioAberto] = useState(null)

  useEffect(() => {
    carregarComissoes()
  }, [])

  const carregarComissoes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (dataInicio) params.append("dataInicio", dataInicio)
      if (dataFim) params.append("dataFim", dataFim)

      const res = await api.get(`/comissoes?${params.toString()}`)
      setDados(res.data)
    } catch (error) {
      console.error("Erro ao carregar comissoes:", error)
    } finally {
      setLoading(false)
    }
  }

  const resumo = useMemo(() => {
    const funcionarios = dados?.funcionarios || []

    return funcionarios.reduce(
      (acc, item) => ({
        vendido: acc.vendido + Number(item.totais?.totalVendido || 0),
        comissao: acc.comissao + Number(item.totais?.comissaoTotal || 0),
        servicos: acc.servicos + Number(item.totais?.comissaoServicos || 0),
        produtos: acc.produtos + Number(item.totais?.comissaoProdutos || 0)
      }),
      { vendido: 0, comissao: 0, servicos: 0, produtos: 0 }
    )
  }, [dados])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
              Comissoes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe vendas, servicos e comissoes por funcionario.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <CampoData label="Inicio" value={dataInicio} onChange={setDataInicio} />
            <CampoData label="Fim" value={dataFim} onChange={setDataFim} />
            <button
              type="button"
              onClick={carregarComissoes}
              className="self-end px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white text-sm font-medium hover:opacity-90"
            >
              Filtrar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard titulo="Total vendido" valor={formatarMoeda(resumo.vendido)} />
          <ResumoCard titulo="Comissao total" valor={formatarMoeda(resumo.comissao)} />
          <ResumoCard titulo="Servicos" valor={formatarMoeda(resumo.servicos)} />
          <ResumoCard titulo="Produtos" valor={formatarMoeda(resumo.produtos)} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-500">Carregando comissoes...</p>
          ) : !dados?.funcionarios?.length ? (
            <p className="p-6 text-gray-500">Nenhum funcionario encontrado.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {dados.funcionarios.map((item) => {
                const aberto = funcionarioAberto === item.usuario.id

                return (
                  <div key={item.usuario.id} className="p-5">
                    <button
                      type="button"
                      onClick={() =>
                        setFuncionarioAberto(aberto ? null : item.usuario.id)
                      }
                      className="w-full text-left grid grid-cols-1 lg:grid-cols-5 gap-4 items-center"
                    >
                      <div className="lg:col-span-2">
                        <p className="font-semibold text-[#2D2E47]">
                          {item.usuario.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.usuario.cargo || item.usuario.email}
                        </p>
                      </div>

                      <ResumoLinha label="Vendido" valor={formatarMoeda(item.totais.totalVendido)} />
                      <ResumoLinha label="Comissao" valor={formatarMoeda(item.totais.comissaoTotal)} destaque />
                      <ResumoLinha label="Itens" valor={item.itens.length} />
                    </button>

                    {aberto && (
                      <div className="mt-5 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                              <th className="py-2 pr-4">Data</th>
                              <th className="py-2 pr-4">Origem</th>
                              <th className="py-2 pr-4">Descricao</th>
                              <th className="py-2 pr-4">Valor</th>
                              <th className="py-2 pr-4">%</th>
                              <th className="py-2 pr-4">Comissao</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.itens.map((linha, index) => (
                              <tr key={`${linha.origem}-${linha.vendaId || linha.agendamentoId}-${index}`} className="border-b border-gray-50">
                                <td className="py-3 pr-4 text-gray-600">{formatarData(linha.data)}</td>
                                <td className="py-3 pr-4 text-gray-600">{linha.origem}</td>
                                <td className="py-3 pr-4 text-[#2D2E47]">{linha.descricao}</td>
                                <td className="py-3 pr-4">{formatarMoeda(linha.valor)}</td>
                                <td className="py-3 pr-4">{Number(linha.percentual)}%</td>
                                <td className="py-3 pr-4 font-semibold text-emerald-700">
                                  {formatarMoeda(linha.comissao)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function CampoData({ label, value, onChange }) {
  return (
    <label className="text-sm text-gray-600">
      <span className="block mb-1">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#3E7996]"
      />
    </label>
  )
}

function ResumoLinha({ label, valor, destaque = false }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`font-bold ${destaque ? "text-emerald-700" : "text-[#2D2E47]"}`}>
        {valor}
      </p>
    </div>
  )
}

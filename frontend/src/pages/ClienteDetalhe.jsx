import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"

export default function ClienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState("resumo")

  useEffect(() => {
    carregarCliente()
  }, [id])

  const carregarCliente = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/clientes/${id}/detalhes`)
      setDados(response.data)
    } catch (error) {
      console.error("Erro ao carregar cliente:", error)
      setDados(null)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data) => {
    if (!data) return "-"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  const formatarDataHora = (data) => {
    if (!data) return "-"
    return new Date(data).toLocaleString("pt-BR")
  }

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="text-gray-600">Carregando cliente...</p>
      </AppLayout>
    )
  }

  if (!dados || !dados.cliente) {
    return (
      <AppLayout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-[#2D2E47] mb-2">
            Cliente não encontrado
          </h1>
          <p className="text-gray-500 mb-4">
            Não foi possível localizar esse cliente.
          </p>

          <button
            onClick={() => navigate("/clientes")}
            className="bg-[#2F8AA3] text-white px-5 py-2.5 rounded-xl hover:opacity-90"
          >
            Voltar para clientes
          </button>
        </div>
      </AppLayout>
    )
  }

  const { cliente, resumo, vendas, produtosComprados, servicosRealizados, contasReceber, pagamentos, historico } = dados

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/clientes")}
              className="text-sm text-[#3E7996] hover:underline mb-2"
            >
              ← Voltar para clientes
            </button>

            <h1 className="text-3xl font-bold text-[#2D2E47]">
              {cliente.nome}
            </h1>

            <p className="text-gray-500 mt-1">
              Visão completa do cliente
            </p>
          </div>

          <span
            className={`text-sm font-semibold px-4 py-2 rounded-full w-fit ${
              cliente.status === "pendente"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {cliente.status === "pendente" ? "Pendente" : "Em dia"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <InfoCard titulo="Telefone" valor={cliente.telefone || "Não informado"} />
          <InfoCard titulo="Email" valor={cliente.email || "Não informado"} />
          <InfoCard titulo="Cadastro" valor={formatarData(cliente.createdAt)} />
          <InfoCard titulo="Status" valor={cliente.status === "pendente" ? "Pendente" : "Em dia"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <ResumoCard titulo="Total Comprado" valor={formatarMoeda(resumo.totalComprado)} />
          <ResumoCard titulo="Total Pago" valor={formatarMoeda(resumo.totalPago)} />
          <ResumoCard titulo="Em Aberto" valor={formatarMoeda(resumo.totalEmAberto)} />
          <ResumoCard titulo="Vencido" valor={formatarMoeda(resumo.totalVencido)} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#2D2E47] mb-3">
            Observações
          </h2>
          <p className="text-gray-600">
            {cliente.observacoes || "Nenhuma observação cadastrada para este cliente."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-wrap gap-2">
          <AbaBotao titulo="Resumo" ativa={abaAtiva === "resumo"} onClick={() => setAbaAtiva("resumo")} />
          <AbaBotao titulo="Vendas" ativa={abaAtiva === "vendas"} onClick={() => setAbaAtiva("vendas")} />
          <AbaBotao titulo="Financeiro" ativa={abaAtiva === "financeiro"} onClick={() => setAbaAtiva("financeiro")} />
          <AbaBotao titulo="Histórico" ativa={abaAtiva === "historico"} onClick={() => setAbaAtiva("historico")} />
        </div>

        {abaAtiva === "resumo" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <BlocoLista
              titulo="Produtos comprados"
              vazio="Nenhum produto comprado ainda."
              itens={produtosComprados}
              renderItem={(item, index) => (
                <LinhaLista
                  key={`${item.vendaId}-${item.nomeItem}-${index}`}
                  titulo={item.nomeItem}
                  subtitulo={`${item.quantidade}x • ${formatarMoeda(item.precoUnitario)}`}
                  valor={formatarMoeda(item.subtotal)}
                  rodape={formatarData(item.createdAt)}
                />
              )}
            />

            <BlocoLista
              titulo="Serviços realizados"
              vazio="Nenhum serviço registrado ainda."
              itens={servicosRealizados}
              renderItem={(item, index) => (
                <LinhaLista
                  key={`${item.vendaId}-${item.nomeItem}-${index}`}
                  titulo={item.nomeItem}
                  subtitulo={`${item.quantidade}x • ${formatarMoeda(item.precoUnitario)}`}
                  valor={formatarMoeda(item.subtotal)}
                  rodape={formatarData(item.createdAt)}
                />
              )}
            />
          </div>
        )}

        {abaAtiva === "vendas" && (
          <BlocoLista
            titulo="Vendas do cliente"
            vazio="Nenhuma venda encontrada."
            itens={vendas}
            renderItem={(venda) => (
              <LinhaLista
                key={venda.id}
                titulo={`Venda #${venda.id}`}
                subtitulo={`${venda.itens.length} item(ns) • ${venda.tipoPreco}`}
                valor={formatarMoeda(venda.totalFinal)}
                rodape={formatarDataHora(venda.createdAt)}
              />
            )}
          />
        )}

        {abaAtiva === "financeiro" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <BlocoLista
              titulo="Contas a receber"
              vazio="Nenhuma conta encontrada."
              itens={contasReceber}
              renderItem={(conta) => (
                <LinhaLista
                  key={conta.id}
                  titulo={conta.descricao || `Conta #${conta.id}`}
                  subtitulo={`Status: ${conta.status}`}
                  valor={formatarMoeda(conta.valorTotal - conta.valorPago)}
                  rodape={
                    conta.vencimento
                      ? `Vencimento: ${formatarData(conta.vencimento)}`
                      : "Sem vencimento"
                  }
                />
              )}
            />

            <BlocoLista
              titulo="Pagamentos"
              vazio="Nenhum pagamento encontrado."
              itens={pagamentos}
              renderItem={(pagamento) => (
                <LinhaLista
                  key={pagamento.id}
                  titulo={pagamento.descricao || `Pagamento #${pagamento.id}`}
                  subtitulo={pagamento.formaPagamento || "Sem forma de pagamento"}
                  valor={formatarMoeda(pagamento.valor)}
                  rodape={formatarDataHora(pagamento.createdAt)}
                />
              )}
            />
          </div>
        )}

        {abaAtiva === "historico" && (
          <BlocoLista
            titulo="Histórico do cliente"
            vazio="Nenhum evento encontrado."
            itens={historico}
            renderItem={(evento, index) => (
              <LinhaLista
                key={`${evento.tipo}-${index}-${evento.data}`}
                titulo={evento.titulo}
                subtitulo={evento.descricao}
                valor={evento.valor !== null ? formatarMoeda(evento.valor) : "-"}
                rodape={formatarDataHora(evento.data)}
              />
            )}
          />
        )}
      </div>
    </AppLayout>
  )
}

function AbaBotao({ titulo, ativa, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
        ativa
          ? "bg-[#2F8AA3] text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {titulo}
    </button>
  )
}

function InfoCard({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-lg font-semibold text-[#2D2E47] mt-2">{valor}</p>
    </div>
  )
}

function ResumoCard({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-[#2D2E47] mt-2">{valor}</p>
    </div>
  )
}

function BlocoLista({ titulo, itens, vazio, renderItem }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#2D2E47]">{titulo}</h2>
      </div>

      {itens.length === 0 ? (
        <div className="p-6 text-gray-500">{vazio}</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {itens.map(renderItem)}
        </div>
      )}
    </div>
  )
}

function LinhaLista({ titulo, subtitulo, valor, rodape }) {
  return (
    <div className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <p className="font-medium text-[#2D2E47]">{titulo}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitulo}</p>
        <p className="text-xs text-gray-400 mt-1">{rodape}</p>
      </div>

      <div className="font-semibold text-[#2D2E47]">{valor}</div>
    </div>
  )
}
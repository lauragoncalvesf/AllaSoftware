import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import ClienteSearchSelect from "../components/ClienteSearchSelect"

export default function Vendas() {

  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [servicos, setServicos] = useState([])

  const [searchParams] = useSearchParams()

  const [clienteId, setClienteId] = useState("")
  const [buscaCliente, setBuscaCliente] = useState("")
  const [mostrarSugestoesCliente, setMostrarSugestoesCliente] = useState(false)

  const [tipoPreco, setTipoPreco] = useState("varejo")
  const [desconto, setDesconto] = useState("")
  const [formaPagamento, setFormaPagamento] = useState("")
  const [valorPago, setValorPago] = useState("")
  const [vencimento, setVencimento] = useState("")
  const [descricaoConta, setDescricaoConta] = useState("")

  const [tipoItem, setTipoItem] = useState("produto")
  const [referenciaId, setReferenciaId] = useState("")
  const [quantidade, setQuantidade] = useState(1)

  const [itens, setItens] = useState([])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    const clienteIdUrl = searchParams.get("clienteId")
    const clienteNomeUrl = searchParams.get("clienteNome")

    if (clienteIdUrl) {
      setClienteId(clienteIdUrl)
    }

    if (clienteNomeUrl) {
      setBuscaCliente(clienteNomeUrl)
    }
}, [searchParams])

  const carregarDados = async () => {
    try {
      const [clientesRes, produtosRes, servicosRes] = await Promise.all([
        api.get("/clientes"),
        api.get("/produtos"),
        api.get("/servicos"),
      ])

      setClientes(clientesRes.data || [])
      setProdutos(produtosRes.data || [])
      setServicos(servicosRes.data || [])
    } catch (error) {
      console.error("Erro ao carregar dados da venda:", error)
    }
  }

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase())
  )

  const opcoesAtuais = tipoItem === "produto" ? produtos : servicos

  const itemSelecionado = opcoesAtuais.find(
    (item) => String(item.id) === String(referenciaId)
  )

  const precoAtual = useMemo(() => {
    if (!itemSelecionado) return 0

    if (tipoItem === "produto") {
      if (tipoPreco === "atacado" && itemSelecionado.precoAtacado) {
        return Number(itemSelecionado.precoAtacado)
      }
      return Number(itemSelecionado.precoVarejo || 0)
    }

    return Number(itemSelecionado.preco || 0)
  }, [itemSelecionado, tipoItem, tipoPreco])

  const totalBruto = useMemo(() => {
    return itens.reduce((acc, item) => acc + Number(item.subtotal || 0), 0)
  }, [itens])

  const totalFinal = useMemo(() => {
    return totalBruto - Number(desconto || 0)
  }, [totalBruto, desconto])

  const valorPagoNumero = Number(valorPago || 0)
  const valorRestante = Math.max(totalFinal - valorPagoNumero, 0)

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const adicionarItem = () => {
    if (!tipoItem || !referenciaId || !quantidade || quantidade < 1) {
      alert("Preencha item e quantidade")
      return
    }

    if (!itemSelecionado) {
      alert("Selecione um item válido")
      return
    }

    const subtotal = Number(quantidade) * Number(precoAtual)

    const novoItem = {
      tipoItem,
      referenciaId: Number(referenciaId),
      nomeItem: itemSelecionado.nome,
      quantidade: Number(quantidade),
      precoUnitario: Number(precoAtual),
      subtotal,
    }

    setItens((prev) => [...prev, novoItem])
    setReferenciaId("")
    setQuantidade(1)
  }

  const removerItem = (index) => {
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  const salvarVenda = async () => {
    /*if (itens.length === 0) {
      alert("Adicione pelo menos 1 item")
      return
    }*/

    if (totalFinal < 0) {
      alert("O desconto não pode ser maior que o total da venda")
      return
    }

    if (valorPagoNumero < 0) {
      alert("O valor pago não pode ser negativo")
      return
    }

    if (valorPagoNumero > totalFinal) {
      alert("O valor pago não pode ser maior que o total final")
      return
    }

    if (!clienteId && valorPagoNumero < totalFinal) {
      alert("Venda sem cliente só pode ser finalizada com pagamento total")
      return
    }

    /*if (valorPagoNumero > 0 && !formaPagamento) {
      alert("Selecione a forma de pagamento")
      return
    }*/

    try {
      setSalvando(true)

      await api.post("/vendas", {
        clienteId: clienteId ? Number(clienteId) : null,
        tipoPreco,
        desconto: Number(desconto || 0),
        formaPagamento: formaPagamento || null,
        valorPago: Number(valorPagoNumero),
        vencimento: valorRestante > 0 ? vencimento || null : null,
        descricaoConta: valorRestante > 0 ? descricaoConta || null : null,
        itens: itens.map((item) => ({
          tipoItem: item.tipoItem,
          referenciaId: item.referenciaId,
          quantidade: item.quantidade,
        })),
      })

      alert("Venda criada com sucesso!")

      setClienteId("")
      setBuscaCliente("")
      setMostrarSugestoesCliente(false)
      setTipoPreco("varejo")
      setDesconto("")
      setFormaPagamento("")
      setValorPago("")
      setVencimento("")
      setDescricaoConta("")
      setTipoItem("produto")
      setReferenciaId("")
      setQuantidade(1)
      setItens([])
    } catch (error) {
      console.error("Erro ao salvar venda:", error)
      alert(error.response?.data?.error || "Erro ao salvar venda")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
            Nova Venda
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Adicione produtos e serviços ao carrinho e finalize a venda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <label className="block text-sm font-medium text-[#2D2E47] mb-2">
            Cliente
          </label>

        <ClienteSearchSelect
          clientes={clientes}
          clienteId={clienteId}
          setClienteId={setClienteId}
          buscaInicial={buscaCliente}
          placeholder="Digite o nome do cliente"
          permitirSemCliente={true}
        />

          <p className="text-xs text-gray-500 mt-2">
            {clienteId
              ? "Cliente selecionado para a venda."
              : "Se não selecionar, a venda será sem cliente."}
          </p>
        </Card>

          <Card>
            <label className="block text-sm font-medium text-[#2D2E47] mb-2">
              Tipo de preço
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoPreco("varejo")}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  tipoPreco === "varejo"
                    ? "bg-[#2F8AA3] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Varejo
              </button>

              <button
                type="button"
                onClick={() => setTipoPreco("atacado")}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  tipoPreco === "atacado"
                    ? "bg-[#2F8AA3] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Atacado
              </button>
            </div>
          </Card>

          <Card>
            <label className="block text-sm font-medium text-[#2D2E47] mb-2">
              Forma de pagamento
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
            >
              <option value="">Selecione</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">Pix</option>
              <option value="cartao_credito">Cartão de crédito</option>
              <option value="cartao_debito">Cartão de débito</option>
            </select>
          </Card>

          <Card>
            <label className="block text-sm font-medium text-[#2D2E47] mb-2">
              Desconto geral
            </label>
            <input
              type="number"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              placeholder="0,00"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <label className="block text-sm font-medium text-[#2D2E47] mb-2">
              Valor pago agora
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={valorPago}
              onChange={(e) => {
                const valor = e.target.value.replace(",", ".")
                if (/^\d*\.?\d*$/.test(valor)) {
                  setValorPago(valor)
                }
              }}
              placeholder="0,00"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
            />
          </Card>

          <Card>
            <label className="block text-sm font-medium text-[#2D2E47] mb-2">
              Vencimento do saldo
            </label>
            <input
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996] disabled:bg-gray-100 disabled:text-gray-400"
              disabled={!clienteId || valorRestante <= 0}
            />

            {!clienteId && (
              <p className="text-sm text-amber-600 mt-2">
                Para gerar conta a receber, selecione um cliente.
              </p>
            )}

            {clienteId && valorRestante <= 0 && totalFinal > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Esse campo libera quando houver saldo restante.
              </p>
            )}
          </Card>

          <Card>
            <label className="block text-sm font-medium text-[#2D2E47] mb-2">
              Descrição da conta
            </label>
            <input
              type="text"
              value={descricaoConta}
              onChange={(e) => setDescricaoConta(e.target.value)}
              placeholder="Ex: restante da venda"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996] disabled:bg-gray-100 disabled:text-gray-400"
              disabled={!clienteId || valorRestante <= 0}
            />

            {!clienteId && (
              <p className="text-sm text-amber-600 mt-2">
                Sem cliente não é possível gerar saldo em aberto.
              </p>
            )}

            {clienteId && valorRestante <= 0 && totalFinal > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Esse campo libera quando houver saldo restante.
              </p>
            )}
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-[#2D2E47] mb-4">
            Adicionar Item
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2E47] mb-2">
                Tipo
              </label>
              <select
                value={tipoItem}
                onChange={(e) => {
                  setTipoItem(e.target.value)
                  setReferenciaId("")
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
              >
                <option value="produto">Produto</option>
                <option value="servico">Serviço</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-[#2D2E47] mb-2">
                Item
              </label>
              <select
                value={referenciaId}
                onChange={(e) => setReferenciaId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
              >
                <option value="">Selecione</option>
                {opcoesAtuais.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2E47] mb-2">
                Quantidade
              </label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={adicionarItem}
                className="w-full bg-[#2F8AA3] text-white px-4 py-3 rounded-xl font-medium hover:opacity-90"
              >
                Adicionar
              </button>
            </div>
          </div>

          {itemSelecionado && (
            <div className="mt-4 text-sm text-gray-600">
              <span className="font-medium">Preço atual:</span>{" "}
              {formatarMoeda(precoAtual)}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#2D2E47]">
              Itens da Venda
            </h2>
          </div>

          {itens.length === 0 ? (
            <div className="p-6 text-gray-500">Nenhum item adicionado.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {itens.map((item, index) => (
                <div
                  key={`${item.tipoItem}-${item.referenciaId}-${index}`}
                  className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-[#2D2E47]">{item.nomeItem}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.tipoItem} • {item.quantidade} x{" "}
                      {formatarMoeda(item.precoUnitario)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-[#2D2E47]">
                      {formatarMoeda(item.subtotal)}
                    </p>

                    <button
                      type="button"
                      onClick={() => removerItem(index)}
                      className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard
            titulo="Total Bruto"
            valor={formatarMoeda(totalBruto)}
            subtitulo="Soma dos itens"
          />
          <ResumoCard
            titulo="Desconto"
            valor={formatarMoeda(desconto || 0)}
            subtitulo="Aplicado na venda"
          />
          <ResumoCard
            titulo="Valor Pago"
            valor={formatarMoeda(valorPagoNumero)}
            subtitulo="Recebido agora"
          />
          <ResumoCard
            titulo="Saldo Restante"
            valor={formatarMoeda(valorRestante)}
            subtitulo="Vai para conta a receber"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResumoCard
            titulo="Total Final"
            valor={formatarMoeda(totalFinal)}
            subtitulo="Valor final da venda"
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Regra da venda</p>
            <p className="text-sm text-[#2D2E47] mt-2">
              {!clienteId
                ? "Sem cliente: precisa pagamento total."
                : valorRestante > 0
                ? "Com cliente: saldo restante vai para conta a receber."
                : "Venda quitada."}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={salvarVenda}
            disabled={salvando}
            className="bg-[#2F8AA3] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Finalizar Venda"}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {children}
    </div>
  )
}

function ResumoCard({ titulo, valor, subtitulo }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-[#2D2E47] mt-2">{valor}</p>
      <p className="text-sm text-gray-400 mt-1">{subtitulo}</p>
    </div>
  )
}
import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"

export default function Servicos() {
  const usuario = JSON.parse(localStorage.getItem("usuario"))
  const isAdmin = usuario?.role === "admin"

  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)

  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState("")
  const [ordem, setOrdem] = useState("asc")

  const [mostrarNovoModal, setMostrarNovoModal] = useState(false)
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false)

  const [novoServico, setNovoServico] = useState({
    nome: "",
    descricao: "",
    preco: "",
    duracao: "",
    status: "ativo",
  })

  const [servicoEditando, setServicoEditando] = useState({
    id: null,
    nome: "",
    descricao: "",
    preco: "",
    duracao: "",
    status: "ativo",
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarServicos()
    }, 300)

    return () => clearTimeout(timer)
  }, [busca, status, ordem])

  const carregarServicos = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (busca) params.append("busca", busca)
      if (status) params.append("status", status)
      if (ordem) params.append("ordem", ordem)

      const response = await api.get(`/servicos?${params.toString()}`)
      setServicos(response.data)
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const abrirEditar = (servico) => {
    setServicoEditando({
      id: servico.id,
      nome: servico.nome || "",
      descricao: servico.descricao || "",
      preco: servico.preco ?? "",
      duracao: servico.duracao ?? "",
      status: servico.status || "ativo",
    })
    setMostrarEditarModal(true)
  }

  const salvarNovoServico = async (e) => {
    e.preventDefault()

    try {
      await api.post("/servicos", {
        nome: novoServico.nome,
        descricao: novoServico.descricao,
        preco: Number(novoServico.preco),
        duracao: novoServico.duracao ? Number(novoServico.duracao) : null,
        status: novoServico.status,
      })

      setNovoServico({
        nome: "",
        descricao: "",
        preco: "",
        duracao: "",
        status: "ativo",
      })

      setMostrarNovoModal(false)
      carregarServicos()
    } catch (error) {
      console.error("Erro ao criar serviço:", error)
      alert(error.response?.data?.error || "Erro ao criar serviço")
    }
  }

  const salvarEdicaoServico = async (e) => {
    e.preventDefault()

    try {
      await api.put(`/servicos/${servicoEditando.id}`, {
        nome: servicoEditando.nome,
        descricao: servicoEditando.descricao,
        preco: Number(servicoEditando.preco),
        duracao: servicoEditando.duracao
          ? Number(servicoEditando.duracao)
          : null,
        status: servicoEditando.status,
      })

      setMostrarEditarModal(false)
      carregarServicos()
    } catch (error) {
      console.error("Erro ao editar serviço:", error)
      alert(error.response?.data?.error || "Erro ao editar serviço")
    }
  }

  const excluirServico = async (id, nome) => {
    const confirmar = window.confirm(`Deseja excluir o serviço "${nome}"?`)
    if (!confirmar) return

    try {
      await api.delete(`/servicos/${id}`)
      carregarServicos()
    } catch (error) {
      console.error("Erro ao excluir serviço:", error)
      alert(error.response?.data?.error || "Erro ao excluir serviço")
    }
  }

  const resumo = useMemo(() => {
    const total = servicos.length
    const ativos = servicos.filter((s) => s.status === "ativo").length
    const inativos = servicos.filter((s) => s.status === "inativo").length

    const ticketMedio =
      total > 0
        ? servicos.reduce((acc, s) => acc + Number(s.preco || 0), 0) / total
        : 0

    return { total, ativos, inativos, ticketMedio }
  }, [servicos])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
              Serviços
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Cadastre, edite e organize os serviços oferecidos.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setMostrarNovoModal(true)}
              className="bg-[#2F8AA3] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm"
            >
              + Novo Serviço
            </button>
          )}
        </div>

        {/* Busca + filtros */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="w-full xl:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar serviço..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3E7996] shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatus("")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                status === ""
                  ? "bg-[#2F8AA3] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Todos
            </button>

            <button
              type="button"
              onClick={() => setStatus("ativo")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                status === "ativo"
                  ? "bg-[#2F8AA3] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Ativos
            </button>

            <button
              type="button"
              onClick={() => setStatus("inativo")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                status === "inativo"
                  ? "bg-[#2F8AA3] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Inativos
            </button>

            <button
              type="button"
              onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              {ordem === "asc" ? "↑ " : "↓ "}
            </button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard
            titulo="Total de Serviços"
            valor={resumo.total}
            corIcone="bg-blue-100 text-blue-600"
          />
          <ResumoCard
            titulo="Serviços Ativos"
            valor={resumo.ativos}
            corIcone="bg-emerald-100 text-emerald-600"
          />
          <ResumoCard
            titulo="Serviços Inativos"
            valor={resumo.inativos}
            corIcone="bg-amber-100 text-amber-600"
          />
          <ResumoCard
            titulo="Preço Médio"
            valor={formatarMoeda(resumo.ticketMedio)}
            corIcone="bg-violet-100 text-violet-600"
          />
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-500">Carregando serviços...</div>
          ) : servicos.length === 0 ? (
            <div className="p-6 text-gray-500">Nenhum serviço encontrado.</div>
          ) : (
            <>
              {/* Tabela desktop */}
              <div className="hidden xl:block">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-500 border-b border-gray-100">
                  <div className="col-span-3">Serviço</div>
                  <div className="col-span-3">Descrição</div>
                  <div className="col-span-2">Preço</div>
                  <div className="col-span-2">Duração</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-right">Ações</div>
                </div>

                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="col-span-3 flex items-center">
                      <p className="font-semibold text-[#2D2E47] truncate">
                        {servico.nome}
                      </p>
                    </div>

                    <div className="col-span-3 flex items-center">
                      <p className="text-sm text-gray-500 truncate">
                        {servico.descricao || "Sem descrição"}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="font-medium text-[#2D2E47]">
                        {formatarMoeda(servico.preco)}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-gray-600">
                        {servico.duracao ? `${servico.duracao} min` : "—"}
                      </p>
                    </div>

                    <div className="col-span-1 flex items-center">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          servico.status === "ativo"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {servico.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => abrirEditar(servico)}
                            className="text-sm px-3 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => excluirServico(servico.id, servico.nome)}
                            className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cards mobile/tablet */}
              <div className="xl:hidden p-4 space-y-4">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="border border-gray-100 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#2D2E47]">
                          {servico.nome}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {servico.descricao || "Sem descrição"}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                          servico.status === "ativo"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {servico.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Preço</p>
                        <p className="font-medium text-[#2D2E47]">
                          {formatarMoeda(servico.preco)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Duração</p>
                        <p className="font-medium text-[#2D2E47]">
                          {servico.duracao ? `${servico.duracao} min` : "—"}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => abrirEditar(servico)}
                          className="text-sm px-3 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => excluirServico(servico.id, servico.nome)}
                          className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-500 border-t border-gray-100">
                <p>Mostrando {servicos.length} serviço(s)</p>

                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
                    Anterior
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-[#2F8AA3] text-white">
                    1
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Novo Serviço */}
      {mostrarNovoModal && isAdmin && (
        <Modal onClose={() => setMostrarNovoModal(false)} titulo="Novo Serviço">
          <form onSubmit={salvarNovoServico} className="space-y-4">
            <CampoInput
              label="Nome do serviço *"
              value={novoServico.nome}
              onChange={(e) =>
                setNovoServico({ ...novoServico, nome: e.target.value })
              }
              placeholder="Digite o nome do serviço"
              required
            />

            <CampoTextarea
              label="Descrição"
              value={novoServico.descricao}
              onChange={(e) =>
                setNovoServico({ ...novoServico, descricao: e.target.value })
              }
              placeholder="Descreva o serviço"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CampoInput
                label="Preço *"
                type="number"
                value={novoServico.preco}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, preco: e.target.value })
                }
                placeholder="0,00"
                required
              />

              <CampoInput
                label="Duração (min)"
                type="number"
                value={novoServico.duracao}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, duracao: e.target.value })
                }
                placeholder="Ex: 60"
              />

              <CampoSelect
                label="Status"
                value={novoServico.status}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, status: e.target.value })
                }
                options={[
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" },
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarNovoModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90"
              >
                Salvar Serviço
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Editar Serviço */}
      {mostrarEditarModal && isAdmin && (
        <Modal onClose={() => setMostrarEditarModal(false)} titulo="Editar Serviço">
          <form onSubmit={salvarEdicaoServico} className="space-y-4">
            <CampoInput
              label="Nome do serviço *"
              value={servicoEditando.nome}
              onChange={(e) =>
                setServicoEditando({ ...servicoEditando, nome: e.target.value })
              }
              placeholder="Digite o nome do serviço"
              required
            />

            <CampoTextarea
              label="Descrição"
              value={servicoEditando.descricao}
              onChange={(e) =>
                setServicoEditando({
                  ...servicoEditando,
                  descricao: e.target.value,
                })
              }
              placeholder="Descreva o serviço"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CampoInput
                label="Preço *"
                type="number"
                value={servicoEditando.preco}
                onChange={(e) =>
                  setServicoEditando({
                    ...servicoEditando,
                    preco: e.target.value,
                  })
                }
                placeholder="0,00"
                required
              />

              <CampoInput
                label="Duração (min)"
                type="number"
                value={servicoEditando.duracao}
                onChange={(e) =>
                  setServicoEditando({
                    ...servicoEditando,
                    duracao: e.target.value,
                  })
                }
                placeholder="Ex: 60"
              />

              <CampoSelect
                label="Status"
                value={servicoEditando.status}
                onChange={(e) =>
                  setServicoEditando({
                    ...servicoEditando,
                    status: e.target.value,
                  })
                }
                options={[
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" },
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarEditarModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  )
}

function ResumoCard({ titulo, valor, subtitulo, corIcone }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${corIcone}`}>
        •
      </div>

      <div>
        <p className="text-sm text-gray-500">{titulo}</p>
        <p className="text-3xl font-bold text-[#2D2E47] mt-1">{valor}</p>
        <p className="text-sm text-gray-400 mt-1">{subtitulo}</p>
      </div>
    </div>
  )
}

function Modal({ titulo, children, onClose, largura = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
      <div className={`w-full ${largura} bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#2D2E47]">{titulo}</h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function CampoInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2D2E47] mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
      />
    </div>
  )
}

function CampoTextarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2D2E47] mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996] resize-none"
      />
    </div>
  )
}

function CampoSelect({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2D2E47] mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
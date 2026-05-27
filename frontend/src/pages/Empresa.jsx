import { useEffect, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import CampoInput from "../components/CampoInput"
import ModalAviso from "../components/ModalAviso"

export default function Empresa() {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const [formEmpresa, setFormEmpresa] = useState({
    nome: "",
    cpfCnpj: "",
    celular: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: ""
  })

  useEffect(() => {
    carregarEmpresa()
  }, [])

  const preencherFormEmpresa = (empresa) => {
    setFormEmpresa({
      nome: empresa?.nome || "",
      cpfCnpj: empresa?.cpfCnpj || "",
      celular: empresa?.celular || "",
      cep: empresa?.cep || "",
      rua: empresa?.rua || "",
      numero: empresa?.numero || "",
      complemento: empresa?.complemento || "",
      bairro: empresa?.bairro || "",
      cidade: empresa?.cidade || "",
      estado: empresa?.estado || ""
    })
  }

  const carregarEmpresa = async () => {
    try {
      setLoading(true)
      const res = await api.get("/perfil")
      const dadosPerfil = res.data
      const empresa = dadosPerfil.empresa || dadosPerfil

      setPerfil(dadosPerfil)
      preencherFormEmpresa(empresa)
    } catch (error) {
      console.error("Erro ao carregar dados da empresa:", error)
      setAviso({
        titulo: "Erro",
        mensagem: "Não foi possível carregar os dados da empresa."
      })
    } finally {
      setLoading(false)
    }
  }

  const salvarEmpresa = async (e) => {
    e.preventDefault()

    try {
      setSalvando(true)

      const res = await api.put("/perfil", {
        empresaNome: formEmpresa.nome,
        cpfCnpj: formEmpresa.cpfCnpj,
        celular: formEmpresa.celular,
        cep: formEmpresa.cep,
        rua: formEmpresa.rua,
        numero: formEmpresa.numero,
        complemento: formEmpresa.complemento,
        bairro: formEmpresa.bairro,
        cidade: formEmpresa.cidade,
        estado: formEmpresa.estado
      })

      const dadosPerfil = res.data
      const empresa = dadosPerfil.empresa || dadosPerfil

      setPerfil(dadosPerfil)
      preencherFormEmpresa(empresa)
      setEditando(false)

      setAviso({
        titulo: "Sucesso",
        mensagem: "Dados da empresa atualizados com sucesso!"
      })
    } catch (error) {
      console.error("Erro ao atualizar dados da empresa:", error)
      setAviso({
        titulo: "Erro",
        mensagem:
          error.response?.data?.error || "Erro ao atualizar dados da empresa"
      })
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="text-gray-500">Carregando dados da empresa...</p>
      </AppLayout>
    )
  }

  const empresa = perfil?.empresa || perfil
  const podeEditarEmpresa = perfil?.role === "admin" || perfil?.tipo === "empresa"

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#2F8AA3]/10 text-[#2F8AA3] flex items-center justify-center text-2xl font-bold shrink-0">
                {(empresa?.nome || "E").charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
                  Empresa
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Complete as informações de contato e endereço da empresa.
                </p>
              </div>
            </div>

            {!editando && podeEditarEmpresa && (
              <button
                type="button"
                onClick={() => setEditando(true)}
                className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90 text-sm font-medium"
              >
                Editar dados
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {!editando ? (
            <div className="space-y-6">
              <Secao titulo="Identificação">
                <InfoItem label="Nome da empresa" valor={empresa?.nome || "-"} />
                <InfoItem label="Email da empresa" valor={empresa?.email || "-"} />
                <InfoItem label="CPF/CNPJ" valor={empresa?.cpfCnpj || "-"} />
              </Secao>

              <Secao titulo="Contato" colunas="md:grid-cols-2">
                <InfoItem label="Celular" valor={empresa?.celular || "-"} />
                <InfoItem label="Email" valor={empresa?.email || "-"} />
              </Secao>

              <Secao titulo="Endereço">
                <InfoItem label="CEP" valor={empresa?.cep || "-"} />
                <InfoItem label="Rua" valor={empresa?.rua || "-"} />
                <InfoItem label="Número" valor={empresa?.numero || "-"} />
                <InfoItem label="Complemento" valor={empresa?.complemento || "-"} />
                <InfoItem label="Bairro" valor={empresa?.bairro || "-"} />
                <InfoItem label="Cidade" valor={empresa?.cidade || "-"} />
                <InfoItem label="Estado" valor={empresa?.estado || "-"} />
              </Secao>
            </div>
          ) : (
            <form onSubmit={salvarEmpresa} className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-[#2D2E47] mb-3">
                  Identificação
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CampoInput
                    label="Nome da empresa"
                    value={formEmpresa.nome}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, nome: e.target.value })
                    }
                    placeholder="Nome da empresa"
                  />

                  <CampoInput
                    label="CPF/CNPJ"
                    value={formEmpresa.cpfCnpj}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, cpfCnpj: e.target.value })
                    }
                    placeholder="CPF ou CNPJ"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#2D2E47] mb-3">
                  Contato
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CampoInput
                    label="Celular"
                    value={formEmpresa.celular}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, celular: e.target.value })
                    }
                    placeholder="Celular"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#2D2E47] mb-3">
                  Endereço
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CampoInput
                    label="CEP"
                    value={formEmpresa.cep}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, cep: e.target.value })
                    }
                    placeholder="CEP"
                  />

                  <CampoInput
                    label="Rua"
                    value={formEmpresa.rua}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, rua: e.target.value })
                    }
                    placeholder="Rua"
                  />

                  <CampoInput
                    label="Número"
                    value={formEmpresa.numero}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, numero: e.target.value })
                    }
                    placeholder="Número"
                  />

                  <CampoInput
                    label="Complemento"
                    value={formEmpresa.complemento}
                    onChange={(e) =>
                      setFormEmpresa({
                        ...formEmpresa,
                        complemento: e.target.value
                      })
                    }
                    placeholder="Complemento"
                  />

                  <CampoInput
                    label="Bairro"
                    value={formEmpresa.bairro}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, bairro: e.target.value })
                    }
                    placeholder="Bairro"
                  />

                  <CampoInput
                    label="Cidade"
                    value={formEmpresa.cidade}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, cidade: e.target.value })
                    }
                    placeholder="Cidade"
                  />

                  <CampoInput
                    label="Estado"
                    value={formEmpresa.estado}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, estado: e.target.value })
                    }
                    placeholder="Estado"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() => {
                    preencherFormEmpresa(empresa)
                    setEditando(false)
                  }}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : "Salvar dados"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {aviso && <ModalAviso {...aviso} onClose={() => setAviso(null)} />}
    </AppLayout>
  )
}

function Secao({ titulo, children, colunas = "md:grid-cols-3" }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[#2D2E47] mb-3">
        {titulo}
      </h2>

      <div className={`grid grid-cols-1 ${colunas} gap-4`}>
        {children}
      </div>
    </div>
  )
}

function InfoItem({ label, valor }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-[#2D2E47] mt-1 break-words">{valor}</p>
    </div>
  )
}

import { useEffect, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"
import { formatarData } from "../utils/formatters"
import CampoInput from "../components/CampoInput"
import ModalAviso from "../components/ModalAviso"

export default function Perfil() {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const [mostrarModalSenhaNome, setMostrarModalSenhaNome] = useState(false)
  const [senhaConfirmacaoNome, setSenhaConfirmacaoNome] = useState("")
  const [mostrarFormularioSenha, setMostrarFormularioSenha] = useState(false)

  const [formNome, setFormNome] = useState("")

  const [formSenha, setFormSenha] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  })

  useEffect(() => {
    carregarPerfil()
  }, [])

  const carregarPerfil = async () => {
    try {
      setLoading(true)

      const res = await api.get("/perfil")
      const dadosPerfil = res.data

      setPerfil(dadosPerfil)
      setFormNome(dadosPerfil.nome || "")
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)

      setAviso({
        titulo: "Erro",
        mensagem: "Não foi possível carregar o perfil."
      })
    } finally {
      setLoading(false)
    }
  }

  const salvarNome = async (e) => {
    e.preventDefault()

    if (!formNome.trim()) {
      setAviso({
        titulo: "Atenção",
        mensagem: "Informe um nome válido."
      })
      return
    }

    if (formNome.trim() === perfil?.nome) {
      setAviso({
        titulo: "Atenção",
        mensagem: "O nome informado é igual ao nome atual."
      })
      return
    }

    setSenhaConfirmacaoNome("")
    setMostrarModalSenhaNome(true)
  }

  const confirmarAlteracaoNome = async (e) => {
    e.preventDefault()

    if (!senhaConfirmacaoNome) {
      setAviso({
        titulo: "Atenção",
        mensagem: "Informe sua senha para confirmar a alteração."
      })
      return
    }

    try {
      setSalvando(true)

      const res = await api.put("/perfil", {
        nome: formNome,
        senhaAtual: senhaConfirmacaoNome
      })

      setPerfil((prev) => ({
        ...prev,
        nome: res.data.nome
      }))

      const usuarioLocal = JSON.parse(localStorage.getItem("usuario"))

      if (usuarioLocal) {
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            ...usuarioLocal,
            nome: res.data.nome
          })
        )
      }

      setMostrarModalSenhaNome(false)
      setSenhaConfirmacaoNome("")

      setAviso({
        titulo: "Sucesso",
        mensagem: "Nome atualizado com sucesso!"
      })
    } catch (error) {
      console.error("Erro ao atualizar nome:", error)

      setAviso({
        titulo: "Erro",
        mensagem: error.response?.data?.error || "Erro ao atualizar nome"
      })
    } finally {
      setSalvando(false)
    }
  }

  const salvarSenha = async (e) => {
    e.preventDefault()

    if (
      !formSenha.senhaAtual ||
      !formSenha.novaSenha ||
      !formSenha.confirmarSenha
    ) {
      setAviso({
        titulo: "Atenção",
        mensagem: "Preencha todos os campos de senha."
      })
      return
    }

    if (formSenha.novaSenha !== formSenha.confirmarSenha) {
      setAviso({
        titulo: "Atenção",
        mensagem: "A nova senha e a confirmação não coincidem."
      })
      return
    }

    if (formSenha.novaSenha.length < 6) {
      setAviso({
        titulo: "Atenção",
        mensagem: "A nova senha deve ter pelo menos 6 caracteres."
      })
      return
    }

    try {
      setSalvando(true)

      await api.put("/perfil", {
        senhaAtual: formSenha.senhaAtual,
        novaSenha: formSenha.novaSenha
      })

      setFormSenha({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: ""
      })

      setMostrarFormularioSenha(false)

      setAviso({
        titulo: "Sucesso",
        mensagem: "Senha alterada com sucesso!"
      })
    } catch (error) {
      console.error("Erro ao alterar senha:", error)

      setAviso({
        titulo: "Erro",
        mensagem: error.response?.data?.error || "Erro ao alterar senha"
      })
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="text-gray-500">Carregando perfil...</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2F8AA3]/10 text-[#2F8AA3] flex items-center justify-center text-2xl font-bold shrink-0">
              {(perfil?.nome || perfil?.email || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#2D2E47]">
                Meu Perfil
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Gerencie suas informações pessoais e senha de acesso.
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#2F8AA3]/10 text-[#2F8AA3]">
                  {perfil?.tipo === "empresa"
                    ? "Empresa"
                    : perfil?.role === "admin"
                    ? "Admin"
                    : "Funcionário"}
                </span>

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {perfil?.email || "Sem email"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações da conta */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2D2E47] mb-4">
            Informações da conta
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <InfoItem label="Email" valor={perfil?.email || "-"} />

            <InfoItem
              label="Tipo de acesso"
              valor={
                perfil?.tipo === "empresa"
                  ? "Administrador da empresa"
                  : perfil?.role === "admin"
                  ? "Admin"
                  : "Funcionário"
              }
            />

            <InfoItem
              label="Membro desde"
              valor={formatarData(perfil?.createdAt)}
            />
          </div>

          <form onSubmit={salvarNome} className="space-y-4">
            <CampoInput
              label="Nome"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
              placeholder="Seu nome"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={salvando}
                className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90 disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar nome"}
              </button>
            </div>
          </form>
        </div>

        {/* Senha */}
        {perfil?.tipo === "usuario" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#2D2E47]">
                  Senha de acesso
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Altere sua senha somente quando necessário.
                </p>
              </div>

              {!mostrarFormularioSenha && (
                <button
                  type="button"
                  onClick={() => setMostrarFormularioSenha(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90 text-sm font-medium"
                >
                  Alterar senha
                </button>
              )}
            </div>

            {mostrarFormularioSenha && (
              <form onSubmit={salvarSenha} className="space-y-4 mt-6">
                <CampoInput
                  label="Senha atual"
                  type="password"
                  value={formSenha.senhaAtual}
                  onChange={(e) =>
                    setFormSenha({
                      ...formSenha,
                      senhaAtual: e.target.value
                    })
                  }
                  placeholder="Digite sua senha atual"
                />

                <CampoInput
                  label="Nova senha"
                  type="password"
                  value={formSenha.novaSenha}
                  onChange={(e) =>
                    setFormSenha({
                      ...formSenha,
                      novaSenha: e.target.value
                    })
                  }
                  placeholder="Mínimo 6 caracteres"
                />

                <CampoInput
                  label="Confirmar nova senha"
                  type="password"
                  value={formSenha.confirmarSenha}
                  onChange={(e) =>
                    setFormSenha({
                      ...formSenha,
                      confirmarSenha: e.target.value
                    })
                  }
                  placeholder="Repita a nova senha"
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={salvando}
                    onClick={() => {
                      setMostrarFormularioSenha(false)
                      setFormSenha({
                        senhaAtual: "",
                        novaSenha: "",
                        confirmarSenha: ""
                      })
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
                    {salvando ? "Salvando..." : "Salvar nova senha"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {mostrarModalSenhaNome && (
        <ModalConfirmarSenha
          senha={senhaConfirmacaoNome}
          setSenha={setSenhaConfirmacaoNome}
          salvando={salvando}
          onClose={() => {
            setMostrarModalSenhaNome(false)
            setSenhaConfirmacaoNome("")
          }}
          onConfirmar={confirmarAlteracaoNome}
        />
      )}

      {aviso && <ModalAviso {...aviso} onClose={() => setAviso(null)} />}
    </AppLayout>
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

function ModalConfirmarSenha({
  senha,
  setSenha,
  salvando,
  onClose,
  onConfirmar
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#2D2E47]">
            Confirmar alteração
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Para alterar seu nome, confirme sua senha atual.
          </p>
        </div>

        <form onSubmit={onConfirmar} className="p-6 space-y-4">
          <CampoInput
            label="Senha atual"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha atual"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2.5 rounded-xl bg-[#2F8AA3] text-white hover:opacity-90 disabled:opacity-50"
            >
              {salvando ? "Confirmando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

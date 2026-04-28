import { useEffect, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import api from "../services/api"

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  const [mostrarModal, setMostrarModal] = useState(false)

  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "funcionario"
  })

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = async () => {
    try {
      const res = await api.get("/usuarios")
      setUsuarios(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const criarUsuario = async (e) => {
    e.preventDefault()

    try {
      await api.post("/usuarios", novoUsuario)

      setNovoUsuario({
        nome: "",
        email: "",
        senha: "",
        role: "funcionario"
      })

      setMostrarModal(false)
      carregarUsuarios()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.error || "Erro ao criar usuário")
    }
  }

  const deletarUsuario = async (id) => {
    if (!confirm("Deseja remover este usuário?")) return

    try {
      await api.delete(`/usuarios/${id}`)
      carregarUsuarios()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2D2E47]">
              Usuários
            </h1>
            <p className="text-gray-500">
              Gerencie quem tem acesso ao sistema
            </p>
          </div>

          <button
            onClick={() => setMostrarModal(true)}
            className="bg-[#2F8AA3] text-white px-4 py-2 rounded-xl"
          >
            + Novo usuário
          </button>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl border">
          {loading ? (
            <p className="p-4">Carregando...</p>
          ) : usuarios.length === 0 ? (
            <p className="p-4 text-gray-500">
              Nenhum usuário encontrado
            </p>
          ) : (
            usuarios.map((u) => (
              <div
                key={u.id}
                className="p-4 border-b flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-[#2D2E47]">
                    {u.nome}
                  </p>
                  <p className="text-sm text-gray-500">
                    {u.email}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      u.role === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role}
                  </span>

                  <button
                    onClick={() => deletarUsuario(u.id)}
                    className="text-red-500 text-sm"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Novo usuário
            </h2>

            <form onSubmit={criarUsuario} className="space-y-3">
              <input
                placeholder="Nome"
                value={novoUsuario.nome}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    nome: e.target.value
                  })
                }
                className="w-full border p-3 rounded-lg"
                required
              />

              <input
                placeholder="Email"
                type="email"
                value={novoUsuario.email}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    email: e.target.value
                  })
                }
                className="w-full border p-3 rounded-lg"
                required
              />

              <input
                placeholder="Senha"
                type="password"
                value={novoUsuario.senha}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    senha: e.target.value
                  })
                }
                className="w-full border p-3 rounded-lg"
                required
              />

              <select
                value={novoUsuario.role}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    role: e.target.value
                  })
                }
                className="w-full border p-3 rounded-lg"
              >
                <option value="funcionario">Funcionário</option>
                <option value="admin">Admin</option>
              </select>

              <button className="w-full bg-[#2F8AA3] text-white py-2 rounded-lg">
                Criar usuário
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
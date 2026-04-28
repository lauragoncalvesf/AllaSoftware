import { z } from "zod"

// Schema para registro de empresa
export const registerSchema = z.object({
  nomeEmpresa: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres"),
  nomeUsuario: z.string().min(3, "Nome do usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
})

// Schema para login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória")
})

// Schema para criar cliente
export const createClienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  status: z.enum(["em_dia", "pendente"]).default("em_dia"),
  observacoes: z.string().optional()
})

// Schema para atualizar cliente
export const updateClienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  status: z.enum(["em_dia", "pendente"]).optional(),
  observacoes: z.string().optional()
})

// Schema para criar transação
export const createTransacaoSchema = z.object({
  tipo: z.enum(["entrada", "saida"], {
    errorMap: () => ({ message: "Tipo deve ser 'entrada' ou 'saida'" })
  }),
  valor: z.number().positive("Valor deve ser maior que 0"),
  categoria: z.string().optional(),
  descricao: z.string().optional(),
  formaPagamento: z.enum(["dinheiro", "cartao", "transferencia", "cheque"]).optional(),
  status: z.enum(["ativa", "cancelada"]).default("ativa")
})

// Schema para criar produto
export const createProdutoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  precoVarejo: z.number().positive("Preço deve ser maior que 0"),
  precoAtacado: z.number().positive("Preço deve ser maior que 0").optional(),
  estoque: z.number().int().nonnegative("Estoque não pode ser negativo").optional().default(0)
})

// Schema para criar venda
export const createVendaSchema = z.object({
  clienteId: z.number().int().positive("Cliente ID inválido"),
  produtos: z.array(
    z.object({
      produtoId: z.number().int().positive("Produto ID inválido"),
      quantidade: z.number().int().positive("Quantidade deve ser maior que 0"),
      preco: z.number().positive("Preço deve ser maior que 0")
    })
  ).min(1, "Deve haver pelo menos um produto"),
  desconto: z.number().nonnegative("Desconto não pode ser negativo").optional().default(0),
  observacoes: z.string().optional()
})

// Schema para criar usuário
export const createUsuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["admin", "gerente", "funcionario"]).default("funcionario")
})

// Função auxiliar de validação
export const validarDados = (schema) => {
  return (req, res, next) => {
    try {
      const validado = schema.parse(req.body)
      req.body = validado
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validação falhou",
          detalhes: error.errors.map(e => ({
            campo: e.path.join("."),
            mensagem: e.message
          }))
        })
      }
      return res.status(400).json({ error: "Erro na validação" })
    }
  }
}

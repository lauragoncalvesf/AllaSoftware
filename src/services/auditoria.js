import prisma from "../config/prisma.js"

// Registrar ação na auditoria
export const registrarAuditoria = async (empresaId, usuarioId, acao, entidade, descricao, dados = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        empresaId,
        usuarioId,
        acao,
        entidade,
        descricao,
        dados: JSON.stringify(dados),
        ipAddress: null, // Pode ser adicionado depois
        userAgent: null,  // Pode ser adicionado depois
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error("❌ Erro ao registrar auditoria:", error.message)
    // Não falhar se auditoria não funcionar
  }
}

// Tipos de ações
export const ACOES_AUDITORIA = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",
  PERMISSAO_NEGADA: "PERMISSAO_NEGADA"
}

// Tipos de entidades
export const ENTIDADES_AUDITORIA = {
  CLIENTE: "CLIENTE",
  TRANSACAO: "TRANSACAO",
  VENDA: "VENDA",
  PRODUTO: "PRODUTO",
  SERVICO: "SERVICO",
  USUARIO: "USUARIO",
  RELATORIO: "RELATORIO",
  EMPRESA: "EMPRESA"
}

import prisma from "../config/prisma.js"

export const permitirPermissao = (modulo, acao = "visualizar") => {
  return async (req, res, next) => {
    try {
      if (req.role === "admin") {
        return next()
      }

      if (!req.usuarioId) {
        return res.status(403).json({
          error: "Usuario sem permissao para esta acao"
        })
      }

      const usuario = await prisma.usuario.findFirst({
        where: {
          id: req.usuarioId,
          empresaId: req.empresaId,
          status: "ativo"
        },
        select: {
          permissoes: true
        }
      })

      if (!usuario?.permissoes?.[modulo]?.[acao]) {
        return res.status(403).json({
          error: "Voce nao tem permissao para executar esta acao"
        })
      }

      next()
    } catch (error) {
      console.error("Erro ao validar permissao:", error)
      res.status(500).json({
        error: "Erro ao validar permissao"
      })
    }
  }
}

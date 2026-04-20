export const permitirRoles = (...rolesPermitidas) => {
    return (req, res, next) => {
      if (!req.role) {
        return res.status(403).json({
          error: "Usuário sem perfil definido"
        })
      }
  
      if (!rolesPermitidas.includes(req.role)) {
        return res.status(403).json({
          error: "Acesso negado para este perfil"
        })
      }
  
      next()
    }
  }
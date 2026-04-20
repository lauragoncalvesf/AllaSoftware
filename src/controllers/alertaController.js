import prisma from "../config/prisma.js"

const inicioDoDia = (data) => {
  const novaData = new Date(data)
  novaData.setHours(0, 0, 0, 0)
  return novaData
}

const fimDoDia = (data) => {
  const novaData = new Date(data)
  novaData.setHours(23, 59, 59, 999)
  return novaData
}

export const alertasVencimento = async (req, res) => {
  try {
    const hoje = new Date()
    const hojeInicio = inicioDoDia(hoje)
    const hojeFim = fimDoDia(hoje)

    const tresDias = new Date()
    tresDias.setDate(hoje.getDate() + 3)
    const tresDiasFim = fimDoDia(tresDias)

    const whereBase = {
      empresaId: req.empresaId,
      status: {
        in: ["pendente", "parcial", "vencido"]
      },
      vencimento: {
        not: null
      }
    }

    const contas = await prisma.contaReceber.findMany({
      where: whereBase,
      include: {
        cliente: true
      },
      orderBy: {
        vencimento: "asc"
      }
    })

    const vencidas = contas
      .filter((conta) => new Date(conta.vencimento) < hojeInicio)
      .map((conta) => ({
        id: conta.id,
        cliente: conta.cliente.nome,
        descricao: conta.descricao,
        valorTotal: conta.valorTotal,
        valorPago: conta.valorPago,
        saldoRestante: conta.valorTotal - conta.valorPago,
        vencimento: conta.vencimento,
        status: conta.status
      }))

    const vencemHoje = contas
      .filter((conta) => {
        const vencimento = new Date(conta.vencimento)
        return vencimento >= hojeInicio && vencimento <= hojeFim
      })
      .map((conta) => ({
        id: conta.id,
        cliente: conta.cliente.nome,
        descricao: conta.descricao,
        valorTotal: conta.valorTotal,
        valorPago: conta.valorPago,
        saldoRestante: conta.valorTotal - conta.valorPago,
        vencimento: conta.vencimento,
        status: conta.status
      }))

    const vencemEmBreve = contas
      .filter((conta) => {
        const vencimento = new Date(conta.vencimento)
        return vencimento > hojeFim && vencimento <= tresDiasFim
      })
      .map((conta) => ({
        id: conta.id,
        cliente: conta.cliente.nome,
        descricao: conta.descricao,
        valorTotal: conta.valorTotal,
        valorPago: conta.valorPago,
        saldoRestante: conta.valorTotal - conta.valorPago,
        vencimento: conta.vencimento,
        status: conta.status
      }))

    res.json({
      vencidas,
      vencemHoje,
      vencemEmBreve
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Erro ao gerar alertas de vencimento"
    })
  }
}
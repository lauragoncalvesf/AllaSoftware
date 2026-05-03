// src/controllers/relatorioController.js
//
// Controller dedicado à geração de PDF de relatório.
// Reutiliza os dados do dashboardController e gera um PDF para download.

import prisma from "../config/prisma.js"
import { gerarRelatorio, imprimirTermico } from "../services/comprovanteService.js"

export const gerarRelatorioPDF = async (req, res) => {
  try {
    const { periodo, imprimir } = req.query
    const empresaId = req.empresaId

    const agora = new Date()
    let dataInicial = null
    let nomePeriodo = "Geral"

    if (periodo === "hoje") {
      dataInicial = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0)
      nomePeriodo = "Hoje"
    } else if (periodo === "7dias") {
      dataInicial = new Date()
      dataInicial.setDate(agora.getDate() - 7)
      nomePeriodo = "Últimos 7 dias"
    } else if (periodo === "mes") {
      dataInicial = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0)
      nomePeriodo = `${String(agora.getMonth() + 1).padStart(2, "0")}/${agora.getFullYear()}`
    }

    const whereBase = {
      empresaId,
      status: "ativa",
      ...(dataInicial ? { createdAt: { gte: dataInicial } } : {})
    }

    // Buscar transações
    const transacoes = await prisma.transacao.findMany({ where: whereBase })

    const totalEntradas = transacoes
      .filter((t) => t.tipo === "entrada")
      .reduce((acc, t) => acc + t.valor, 0)

    const totalSaidas = transacoes
      .filter((t) => t.tipo === "saida")
      .reduce((acc, t) => acc + t.valor, 0)

    const lucro = totalEntradas - totalSaidas

    // Vendas agrupadas por dia
    const vendas = await prisma.venda.findMany({
      where: {
        empresaId,
        ...(dataInicial ? { createdAt: { gte: dataInicial } } : {})
      },
      include: { itens: true }
    })

    const vendasPorDiaMap = {}
    for (const venda of vendas) {
      const dia = venda.createdAt.toISOString().slice(0, 10)
      if (!vendasPorDiaMap[dia]) vendasPorDiaMap[dia] = { total: 0, qtd: 0 }
      vendasPorDiaMap[dia].total += venda.totalFinal
      vendasPorDiaMap[dia].qtd += 1
    }

    const vendasPorDia = Object.entries(vendasPorDiaMap)
      .map(([dia, { total, qtd }]) => ({ dia, total, qtd }))
      .sort((a, b) => a.dia.localeCompare(b.dia))

    // Contas a receber resumidas
    const contas = await prisma.contaReceber.findMany({ where: { empresaId } })
    const contasResumidas = {
      pendentes: contas.filter((c) => c.status === "pendente" || c.status === "parcial").length,
      vencidas: contas.filter((c) => c.status === "vencido").length,
      valorTotal: contas
        .filter((c) => c.status !== "pago")
        .reduce((acc, c) => acc + (c.valorTotal - c.valorPago), 0)
    }

    const dadosRelatorio = {
      periodo: nomePeriodo,
      resumo: { entradas: totalEntradas, saidas: totalSaidas, lucro },
      vendasPorDia,
      contasResumidas
    }

    const empresa = { nome: process.env.EMPRESA_NOME, cnpj: process.env.EMPRESA_CNPJ }
    const { pdf, texto } = await gerarRelatorio(dadosRelatorio, empresa)

    // Se passou ?imprimir=1, envia para a térmica além de retornar o PDF
    if (imprimir === "1") {
      await imprimirTermico(texto, pdf).catch((e) =>
        console.warn("[Impressora] Falha ao imprimir relatório:", e)
      )
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-${periodo || "geral"}-${Date.now()}.pdf"`,
      "Content-Length": pdf.length
    })

    res.send(pdf)
  } catch (error) {
    console.error("[Relatório] Erro ao gerar PDF:", error)
    res.status(500).json({ error: "Erro ao gerar relatório PDF" })
  }
}

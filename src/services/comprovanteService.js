// src/services/comprovanteService.js
//
// Dependências necessárias:
//   npm install pdfkit node-thermal-printer
//
// Para impressora térmica via rede: configure THERMAL_PRINTER_IP e THERMAL_PRINTER_PORT no .env
// Para impressora térmica USB/Serial: configure THERMAL_PRINTER_INTERFACE (ex: /dev/usb/lp0)

import PDFDocument from "pdfkit"
import { printer as ThermalPrinter, types as PrinterTypes } from "node-thermal-printer"

// ─── Configuração da impressora térmica ───────────────────────────────────────

const criarImpressoraTermica = () => {
  const tipo = process.env.THERMAL_PRINTER_TYPE || "EPSON"
  const iface = process.env.THERMAL_PRINTER_INTERFACE

  // Rede TCP/IP
  if (process.env.THERMAL_PRINTER_IP) {
    return new ThermalPrinter({
      type: PrinterTypes[tipo],
      interface: `tcp://${process.env.THERMAL_PRINTER_IP}:${process.env.THERMAL_PRINTER_PORT || 9100}`,
      characterSet: "PC860_PORTUGUESE",
      removeSpecialCharacters: false,
      options: { timeout: 5000 }
    })
  }

  // Windows (printer:NomeDaImpressora) ou Linux USB/Serial (/dev/usb/lp0)
  if (iface) {
    return new ThermalPrinter({
      type: PrinterTypes[tipo],
      interface: iface,
      characterSet: "PC860_PORTUGUESE",
      removeSpecialCharacters: false
    })
  }

  return null
}

// ─── Helpers de formatação ────────────────────────────────────────────────────

const formatarDinheiro = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const formatarData = (data) =>
  new Date(data).toLocaleString("pt-BR", { timeZone: "America/Fortaleza" })

const linha = (char = "-", tamanho = 42) => char.repeat(tamanho)

// ─── 1. COMPROVANTE DE VENDA ──────────────────────────────────────────────────

/**
 * Gera comprovante de venda finalizada.
 * @param {object} venda - Objeto retornado pelo criarVenda (inclui itens, contaReceber)
 * @param {object} [empresa] - Dados da empresa (nome, cnpj, telefone) – opcional
 * @returns {{ pdf: Buffer, texto: string }}
 */
export const gerarComprovanteVenda = async (venda, empresa = {}) => {
  const texto = [
    linha("="),
    centralizarTexto(empresa.nome || "COMPROVANTE DE VENDA", 42),
    empresa.cnpj ? centralizarTexto(`CNPJ: ${empresa.cnpj}`, 42) : null,
    empresa.telefone ? centralizarTexto(`Tel: ${empresa.telefone}`, 42) : null,
    linha("="),
    `Venda #${venda.id}`,
    `Data: ${formatarData(venda.createdAt)}`,
    venda.clienteId ? `Cliente ID: ${venda.clienteId}` : "Cliente: Consumidor Final",
    linha(),
    "ITENS:",
    ...venda.itens.map(
      (item) =>
        `${item.nomeItem}\n  ${item.quantidade}x ${formatarDinheiro(item.precoUnitario)} = ${formatarDinheiro(item.subtotal)}`
    ),
    linha(),
    `Subtotal:  ${formatarDinheiro(venda.totalBruto)}`,
    venda.desconto > 0 ? `Desconto:  -${formatarDinheiro(venda.desconto)}` : null,
    `TOTAL:     ${formatarDinheiro(venda.totalFinal)}`,
    linha(),
    venda.transacaoFinanceira
      ? `Pago:      ${formatarDinheiro(venda.transacaoFinanceira.valor)}`
      : "Pago:      R$ 0,00",
    venda.contaReceberGerada
      ? `Restante:  ${formatarDinheiro(venda.totalFinal - (venda.transacaoFinanceira?.valor || 0))} (conta a receber)`
      : null,
    linha("="),
    centralizarTexto("Obrigado pela preferência!", 42),
    linha("="),
    ""
  ]
    .filter((l) => l !== null)
    .join("\n")

  const pdf = await gerarPDF({
    titulo: `Comprovante de Venda #${venda.id}`,
    linhas: texto.split("\n")
  })

  return { pdf, texto }
}

// ─── 2. COMPROVANTE DE RECEBIMENTO (Conta a Receber) ─────────────────────────

/**
 * Gera comprovante de pagamento de conta a receber.
 * @param {object} pagamento - { pagamento, conta, saldoRestante, transacaoFinanceira }
 * @param {object} [empresa] - Dados da empresa – opcional
 */
export const gerarComprovantePagamentoConta = async (pagamento, empresa = {}) => {
  const { conta, pagamento: pag, saldoRestante, transacaoFinanceira } = pagamento

  const texto = [
    linha("="),
    centralizarTexto(empresa.nome || "RECIBO DE PAGAMENTO", 42),
    linha("="),
    `Recibo #${pag.id}`,
    `Data: ${formatarData(pag.createdAt)}`,
    `Cliente: ${conta.cliente?.nome || `ID ${conta.clienteId}`}`,
    linha(),
    `Conta #${conta.id}`,
    conta.descricao ? `Descrição: ${conta.descricao}` : null,
    `Valor total da conta: ${formatarDinheiro(conta.valorTotal)}`,
    linha(),
    `Valor recebido: ${formatarDinheiro(pag.valor)}`,
    pag.formaPagamento ? `Forma de pag.: ${pag.formaPagamento}` : null,
    linha(),
    `Saldo restante: ${formatarDinheiro(saldoRestante)}`,
    conta.status === "pago"
      ? centralizarTexto("*** CONTA QUITADA ***", 42)
      : `Status: ${conta.status.toUpperCase()}`,
    linha("="),
    centralizarTexto("Obrigado!", 42),
    ""
  ]
    .filter((l) => l !== null)
    .join("\n")

  const pdf = await gerarPDF({
    titulo: `Recibo de Pagamento #${pag.id}`,
    linhas: texto.split("\n")
  })

  return { pdf, texto }
}

// ─── 3. COMPROVANTE DE CANCELAMENTO / ESTORNO ────────────────────────────────

/**
 * Gera comprovante de cancelamento ou estorno de transação.
 * @param {object} dados - { transacaoOriginal, transacaoEstorno?, message, tipo: 'cancelamento'|'estorno' }
 * @param {object} [empresa] - Dados da empresa – opcional
 */
export const gerarComprovanteTransacaoCancelada = async (dados, empresa = {}) => {
  const { transacaoOriginal, transacaoEstorno, tipo } = dados
  const titulo = tipo === "estorno" ? "COMPROVANTE DE ESTORNO" : "COMPROVANTE DE CANCELAMENTO"

  const texto = [
    linha("="),
    centralizarTexto(empresa.nome || titulo, 42),
    centralizarTexto(titulo, 42),
    linha("="),
    `Data: ${formatarData(new Date())}`,
    linha(),
    "TRANSAÇÃO ORIGINAL:",
    `  ID: #${transacaoOriginal.id}`,
    `  Tipo: ${transacaoOriginal.tipo.toUpperCase()}`,
    `  Valor: ${formatarDinheiro(transacaoOriginal.valor)}`,
    transacaoOriginal.categoria ? `  Categoria: ${transacaoOriginal.categoria}` : null,
    transacaoOriginal.descricao ? `  Descrição: ${transacaoOriginal.descricao}` : null,
    `  Status: ${transacaoOriginal.status.toUpperCase()}`,
    transacaoEstorno
      ? [
          linha(),
          "TRANSAÇÃO DE ESTORNO GERADA:",
          `  ID: #${transacaoEstorno.id}`,
          `  Tipo: ${transacaoEstorno.tipo.toUpperCase()}`,
          `  Valor: ${formatarDinheiro(transacaoEstorno.valor)}`
        ].join("\n")
      : null,
    linha("="),
    centralizarTexto("Guarde este comprovante.", 42),
    ""
  ]
    .filter((l) => l !== null)
    .join("\n")

  const pdf = await gerarPDF({
    titulo,
    linhas: texto.split("\n")
  })

  return { pdf, texto }
}

// ─── 4. COMPROVANTE DE RELATÓRIO ──────────────────────────────────────────────

/**
 * Gera comprovante/PDF de relatório do dashboard.
 * @param {object} dados - Dados retornados pelo dashboardFinanceiro
 * @param {object} [empresa] - Dados da empresa – opcional
 */
export const gerarRelatorio = async (dados, empresa = {}) => {
  const { periodo, resumo, vendasPorDia, contasResumidas, topClientes } = dados

  const linhasVendasDia = vendasPorDia
    ? vendasPorDia.map((d) => `  ${d.dia}: ${formatarDinheiro(d.total)} (${d.qtd} vendas)`)
    : []

  const linhasTopClientes = topClientes
    ? topClientes.map((c, i) => `  ${i + 1}. ${c.nome}: ${formatarDinheiro(c.total)}`)
    : []

  const texto = [
    linha("="),
    centralizarTexto(empresa.nome || "RELATÓRIO FINANCEIRO", 42),
    centralizarTexto(`Período: ${periodo || "Geral"}`, 42),
    centralizarTexto(`Gerado em: ${formatarData(new Date())}`, 42),
    linha("="),
    "RESUMO:",
    `  Entradas:  ${formatarDinheiro(resumo?.entradas || dados.totalEntradas || 0)}`,
    `  Saídas:    ${formatarDinheiro(resumo?.saidas || dados.totalSaidas || 0)}`,
    `  Saldo:     ${formatarDinheiro(resumo?.lucro || dados.lucro || 0)}`,
    linha(),
    ...(linhasVendasDia.length
      ? ["VENDAS POR DIA:", ...linhasVendasDia, linha()]
      : []),
    contasResumidas
      ? [
          "CONTAS A RECEBER:",
          `  Pendentes: ${contasResumidas.pendentes || 0}`,
          `  Vencidas:  ${contasResumidas.vencidas || 0}`,
          `  Total:     ${formatarDinheiro(contasResumidas.valorTotal || 0)}`,
          linha()
        ].join("\n")
      : null,
    ...(linhasTopClientes.length
      ? ["TOP CLIENTES:", ...linhasTopClientes, linha()]
      : []),
    linha("="),
    ""
  ]
    .filter((l) => l !== null)
    .join("\n")

  const pdf = await gerarPDF({
    titulo: `Relatório Financeiro – ${periodo || "Geral"}`,
    linhas: texto.split("\n"),
    paisagem: false
  })

  return { pdf, texto }
}

// ─── Envio para impressora térmica ────────────────────────────────────────────

/**
 * Envia texto formatado para a impressora térmica configurada.
 * @param {string} texto - Texto gerado pelos métodos acima
 * @returns {boolean} true se imprimiu com sucesso, false se não há impressora configurada
 */
import pdfToPrinter  from "pdf-to-printer"
import { writeFileSync, unlinkSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

export const imprimirTermico = async (texto, pdfBuffer) => {
  const printerName = process.env.THERMAL_PRINTER_NAME

  if (!printerName) {
    console.warn("[Impressora] THERMAL_PRINTER_NAME não configurado no .env")
    return false
  }

  if (!pdfBuffer) {
    console.warn("[Impressora] PDF não fornecido")
    return false
  }

  const tmpFile = join(tmpdir(), `comprovante_${Date.now()}.pdf`)

  try {
    writeFileSync(tmpFile, pdfBuffer)
await pdfToPrinter.print(tmpFile, { printer: printerName })
    console.log("[Impressora] Impresso com sucesso.")
    return true
  } catch (err) {
    console.error("[Impressora] Falha ao imprimir:", err.message)
    return false
  } finally {
    try { unlinkSync(tmpFile) } catch {}
  }
}

// ─── Geração de PDF com pdfkit ────────────────────────────────────────────────

const gerarPDF = ({ titulo, linhas }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [226, 800], // Largura de 80mm em pontos (~226pt). Altura automática.
      margin: 10,
      autoFirstPage: true
    })

    const chunks = []
    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    doc.font("Courier-Bold").fontSize(9).text(titulo, { align: "center" })
    doc.moveDown(0.3)
    doc.font("Courier").fontSize(8)

    for (const linha of linhas) {
      if (linha.startsWith("===") || linha.startsWith("---")) {
        doc.moveDown(0.1)
      } else {
        doc.text(linha, { lineGap: 1 })
      }
    }

    doc.end()
  })
}

// ─── Utilitário ───────────────────────────────────────────────────────────────

const centralizarTexto = (texto, largura) => {
  const espaco = Math.max(0, Math.floor((largura - texto.length) / 2))
  return " ".repeat(espaco) + texto
}

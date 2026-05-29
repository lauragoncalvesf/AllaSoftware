-- CreateTable
CREATE TABLE "ContaPagar" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorPago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "vencimento" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaPagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoContaPagar" (
    "id" SERIAL NOT NULL,
    "contaPagarId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "transacaoId" INTEGER,
    "valor" DOUBLE PRECISION NOT NULL,
    "formaPagamento" TEXT,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagamentoContaPagar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContaPagar_empresaId_idx" ON "ContaPagar"("empresaId");

-- CreateIndex
CREATE INDEX "ContaPagar_status_idx" ON "ContaPagar"("status");

-- CreateIndex
CREATE INDEX "ContaPagar_vencimento_idx" ON "ContaPagar"("vencimento");

-- CreateIndex
CREATE INDEX "PagamentoContaPagar_empresaId_idx" ON "PagamentoContaPagar"("empresaId");

-- CreateIndex
CREATE INDEX "PagamentoContaPagar_contaPagarId_idx" ON "PagamentoContaPagar"("contaPagarId");

-- CreateIndex
CREATE INDEX "PagamentoContaPagar_transacaoId_idx" ON "PagamentoContaPagar"("transacaoId");

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoContaPagar" ADD CONSTRAINT "PagamentoContaPagar_contaPagarId_fkey" FOREIGN KEY ("contaPagarId") REFERENCES "ContaPagar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoContaPagar" ADD CONSTRAINT "PagamentoContaPagar_transacaoId_fkey" FOREIGN KEY ("transacaoId") REFERENCES "Transacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

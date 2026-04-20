-- AlterTable
ALTER TABLE "ContaReceber" ALTER COLUMN "status" SET DEFAULT 'pendente';

-- CreateTable
CREATE TABLE "PagamentoContaReceber" (
    "id" SERIAL NOT NULL,
    "contaReceberId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "formaPagamento" TEXT,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagamentoContaReceber_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoContaReceber" ADD CONSTRAINT "PagamentoContaReceber_contaReceberId_fkey" FOREIGN KEY ("contaReceberId") REFERENCES "ContaReceber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

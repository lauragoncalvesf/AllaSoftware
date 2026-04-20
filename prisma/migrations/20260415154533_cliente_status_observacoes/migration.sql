-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'em_dia';

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "descricao" TEXT,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorPago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "vencimento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("id")
);

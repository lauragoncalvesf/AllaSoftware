-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "comissaoPercentual" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Servico" ADD COLUMN     "comissaoPercentual" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "comissaoPercentualPadrao" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "vendedorId" INTEGER;

-- CreateIndex
CREATE INDEX "Venda_vendedorId_idx" ON "Venda"("vendedorId");

-- CreateIndex
CREATE INDEX "Venda_empresaId_idx" ON "Venda"("empresaId");

-- CreateIndex
CREATE INDEX "Venda_createdAt_idx" ON "Venda"("createdAt");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

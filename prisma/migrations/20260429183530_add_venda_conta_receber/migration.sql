-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "contaReceberId" INTEGER;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_contaReceberId_fkey" FOREIGN KEY ("contaReceberId") REFERENCES "ContaReceber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

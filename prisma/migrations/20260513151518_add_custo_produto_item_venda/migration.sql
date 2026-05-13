-- AlterTable
ALTER TABLE "ItemVenda" ADD COLUMN     "custoTotal" DOUBLE PRECISION,
ADD COLUMN     "custoUnitario" DOUBLE PRECISION,
ADD COLUMN     "lucroBruto" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "precoCusto" DOUBLE PRECISION;

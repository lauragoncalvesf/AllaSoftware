ALTER TABLE "ContaPagar"
ADD COLUMN IF NOT EXISTS "fornecedor" TEXT;

ALTER TABLE "ContaPagar"
ADD COLUMN IF NOT EXISTS "observacoes" TEXT;

ALTER TABLE "ContaPagar"
ALTER COLUMN "descricao" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "ContaPagar_createdAt_idx"
ON "ContaPagar"("createdAt");

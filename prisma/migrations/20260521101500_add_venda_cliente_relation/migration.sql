-- CreateIndex
CREATE INDEX "Venda_clienteId_idx" ON "Venda"("clienteId");

-- Existing databases may have sales with stale clienteId values.
UPDATE "Venda"
SET "clienteId" = NULL
WHERE "clienteId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "Cliente"
    WHERE "Cliente"."id" = "Venda"."clienteId"
  );

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

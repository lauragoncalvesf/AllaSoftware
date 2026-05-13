-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "preSelecionarAgendamento" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profissional" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tipoEquipe" TEXT NOT NULL DEFAULT 'profissional';

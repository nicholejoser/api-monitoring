-- AlterTable
ALTER TABLE "terminal_nodes" ALTER COLUMN "voipProvider" DROP NOT NULL,
ALTER COLUMN "voipProviderId" DROP NOT NULL;

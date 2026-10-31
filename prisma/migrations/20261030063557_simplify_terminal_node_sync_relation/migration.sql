/*
  Warnings:

  - You are about to drop the `terminal_node_sync_items` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[fiberVuId,syncId]` on the table `terminal_nodes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `syncId` to the `terminal_nodes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "terminal_node_sync_items" DROP CONSTRAINT "terminal_node_sync_items_syncId_fkey";

-- DropForeignKey
ALTER TABLE "terminal_node_sync_items" DROP CONSTRAINT "terminal_node_sync_items_terminalNodeId_fkey";

-- DropIndex
DROP INDEX "terminal_nodes_fiberVuId_key";

-- AlterTable
ALTER TABLE "terminal_node_syncs" ALTER COLUMN "startDate" SET DATA TYPE DATE,
ALTER COLUMN "endDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "terminal_nodes" ADD COLUMN     "syncId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "terminal_node_sync_items";

-- CreateIndex
CREATE INDEX "terminal_nodes_syncId_idx" ON "terminal_nodes"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_nodes_fiberVuId_syncId_key" ON "terminal_nodes"("fiberVuId", "syncId");

-- AddForeignKey
ALTER TABLE "terminal_nodes" ADD CONSTRAINT "terminal_nodes_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "terminal_node_syncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

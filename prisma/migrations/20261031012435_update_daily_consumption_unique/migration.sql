/*
  Warnings:

  - A unique constraint covering the columns `[fiberVuId,terminalNodeId]` on the table `daily_consumption` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "daily_consumption_fiberVuId_key";

-- CreateIndex
CREATE UNIQUE INDEX "daily_consumption_fiberVuId_terminalNodeId_key" ON "daily_consumption"("fiberVuId", "terminalNodeId");

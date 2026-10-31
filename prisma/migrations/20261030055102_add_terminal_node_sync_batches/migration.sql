-- CreateTable
CREATE TABLE "terminal_node_syncs" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pulledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terminal_node_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminal_node_sync_items" (
    "syncId" INTEGER NOT NULL,
    "terminalNodeId" INTEGER NOT NULL,

    CONSTRAINT "terminal_node_sync_items_pkey" PRIMARY KEY ("syncId","terminalNodeId")
);

-- CreateIndex
CREATE INDEX "terminal_node_sync_items_terminalNodeId_idx" ON "terminal_node_sync_items"("terminalNodeId");

-- AddForeignKey
ALTER TABLE "terminal_node_sync_items" ADD CONSTRAINT "terminal_node_sync_items_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "terminal_node_syncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminal_node_sync_items" ADD CONSTRAINT "terminal_node_sync_items_terminalNodeId_fkey" FOREIGN KEY ("terminalNodeId") REFERENCES "terminal_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

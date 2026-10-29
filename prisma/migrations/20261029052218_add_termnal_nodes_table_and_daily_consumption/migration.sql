-- CreateTable
CREATE TABLE "terminal_nodes" (
    "id" SERIAL NOT NULL,
    "fiberVuId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "cityName" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "clientIdentifier" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientOuterIdentifier" TEXT NOT NULL,
    "comment" TEXT,
    "contact" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdByName" TEXT NOT NULL,
    "customVlanTaggingIptvId" INTEGER,
    "customVlanTaggingNetId" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedById" INTEGER,
    "email" TEXT NOT NULL,
    "fixIp" TEXT,
    "hookedAt" TIMESTAMP(3) NOT NULL,
    "hookedById" INTEGER NOT NULL,
    "hookedByName" TEXT NOT NULL,
    "isFtth" BOOLEAN NOT NULL,
    "isPppoe" BOOLEAN NOT NULL,
    "isPppoeActive" BOOLEAN NOT NULL,
    "language" TEXT NOT NULL,
    "mapDataId" INTEGER NOT NULL,
    "mapDataName" TEXT NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "modifiedById" INTEGER NOT NULL,
    "modifiedByName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "numberExt" TEXT NOT NULL,
    "oltName" TEXT NOT NULL,
    "onuOltId" INTEGER NOT NULL,
    "opticalDeviceId" INTEGER NOT NULL,
    "outerIdentity" TEXT,
    "packageName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "radiusPassword" TEXT,
    "radiusUsername" TEXT,
    "rfEnabled" BOOLEAN NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "serviceAreaId" INTEGER,
    "serviceAreaName" TEXT,
    "sipData" JSONB,
    "status" TEXT NOT NULL,
    "statusId" INTEGER NOT NULL,
    "statusOperational" BOOLEAN NOT NULL,
    "streetId" INTEGER NOT NULL,
    "streetName" TEXT NOT NULL,
    "terminalNodeOltId" TEXT NOT NULL,
    "todoCount" INTEGER,
    "todoTaskIds" JSONB,
    "tr069Enabled" BOOLEAN NOT NULL,
    "voipProvider" TEXT NOT NULL,
    "voipProviderId" TEXT NOT NULL,
    "wifi" BOOLEAN NOT NULL,

    CONSTRAINT "terminal_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_consumption" (
    "id" SERIAL NOT NULL,
    "fiberVuId" INTEGER NOT NULL,
    "clientName" TEXT NOT NULL,
    "consumptionDay" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "down" TEXT NOT NULL,
    "terminalNodeId" INTEGER NOT NULL,
    "up" TEXT NOT NULL,

    CONSTRAINT "daily_consumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "terminal_nodes_fiberVuId_key" ON "terminal_nodes"("fiberVuId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_consumption_fiberVuId_key" ON "daily_consumption"("fiberVuId");

-- CreateIndex
CREATE INDEX "daily_consumption_terminalNodeId_idx" ON "daily_consumption"("terminalNodeId");

-- CreateIndex
CREATE INDEX "daily_consumption_consumptionDay_idx" ON "daily_consumption"("consumptionDay");

-- AddForeignKey
ALTER TABLE "daily_consumption" ADD CONSTRAINT "daily_consumption_terminalNodeId_fkey" FOREIGN KEY ("terminalNodeId") REFERENCES "terminal_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `cityId` on table `terminal_nodes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clientId` on table `terminal_nodes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "terminal_nodes" ALTER COLUMN "cityId" SET NOT NULL,
ALTER COLUMN "clientId" SET NOT NULL;

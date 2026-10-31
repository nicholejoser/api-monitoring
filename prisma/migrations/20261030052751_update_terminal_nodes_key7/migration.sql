/*
  Warnings:

  - Made the column `createdAt` on table `terminal_nodes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hookedAt` on table `terminal_nodes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `modifiedAt` on table `terminal_nodes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "terminal_nodes" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "hookedAt" SET NOT NULL,
ALTER COLUMN "modifiedAt" SET NOT NULL;

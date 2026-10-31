/*
  Warnings:

  - The `todoTaskIds` column on the `terminal_nodes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "terminal_nodes" DROP COLUMN "todoTaskIds",
ADD COLUMN     "todoTaskIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

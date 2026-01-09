/*
  Warnings:

  - You are about to drop the column `placed_count` on the `b2b_placements` table. All the data in the column will be lost.
  - You are about to drop the column `submissions_count` on the `b2b_placements` table. All the data in the column will be lost.
  - Added the required column `candidate_id` to the `b2b_placements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `b2b_placements` table without a default value. This is not possible if the table is not empty.
  - Made the column `requirement_id` on table `b2b_placements` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "b2b_placements" DROP COLUMN "placed_count",
DROP COLUMN "submissions_count",
ADD COLUMN     "candidate_id" TEXT NOT NULL,
ADD COLUMN     "client_id" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "requirement_id" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

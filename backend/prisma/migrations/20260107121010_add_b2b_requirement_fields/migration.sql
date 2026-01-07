/*
  Warnings:

  - You are about to drop the column `budget_max` on the `b2b_requirements` table. All the data in the column will be lost.
  - You are about to drop the column `budget_min` on the `b2b_requirements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "b2b_requirements" DROP COLUMN "budget_max",
DROP COLUMN "budget_min",
ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "employment_type" TEXT,
ADD COLUMN     "frequency" TEXT,
ADD COLUMN     "max_experience" INTEGER,
ADD COLUMN     "min_experience" INTEGER,
ADD COLUMN     "notice_period" TEXT,
ADD COLUMN     "primary_skills" TEXT[],
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "secondary_skills" TEXT[],
ADD COLUMN     "work_mode" TEXT;

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

-- AlterTable
ALTER TABLE "Service" DROP COLUMN IF EXISTS "experienceLevel";
ALTER TABLE "Service" ADD COLUMN "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'INTERMEDIATE';

/*
  Warnings:

  - You are about to drop the column `duration` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `SubSection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "duration",
ADD COLUMN     "durationTime" TEXT;

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "duration",
ADD COLUMN     "durationTime" TEXT;

-- AlterTable
ALTER TABLE "SubSection" DROP COLUMN "duration",
ADD COLUMN     "durationTime" TEXT;

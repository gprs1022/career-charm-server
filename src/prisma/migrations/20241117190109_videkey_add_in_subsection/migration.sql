/*
  Warnings:

  - Added the required column `videoKey` to the `SubSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubSection" ADD COLUMN     "videoKey" TEXT NOT NULL;

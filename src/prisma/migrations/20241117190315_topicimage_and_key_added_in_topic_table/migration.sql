/*
  Warnings:

  - You are about to drop the column `image` on the `Topic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "image",
ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "topicImage" TEXT;

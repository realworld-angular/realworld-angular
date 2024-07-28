/*
  Warnings:

  - A unique constraint covering the columns `[pollId,order]` on the table `PollOption` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pollId,text]` on the table `PollOption` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `PollOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PollOption" ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PollOption_pollId_order_key" ON "PollOption"("pollId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PollOption_pollId_text_key" ON "PollOption"("pollId", "text");

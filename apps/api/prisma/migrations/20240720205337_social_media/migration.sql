-- CreateEnum
CREATE TYPE "SocialMediaType" AS ENUM ('FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'OTHER');

-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "SocialMediaLink" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" "SocialMediaType" NOT NULL,
    "communityId" INTEGER NOT NULL,

    CONSTRAINT "SocialMediaLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialMediaLink" ADD CONSTRAINT "SocialMediaLink_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

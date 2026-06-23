-- CreateEnum
CREATE TYPE "ImportedFrom" AS ENUM ('TWITTER', 'GOOGLE', 'PRODUCTHUNT');

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "externalLink" TEXT,
ADD COLUMN     "importedFrom" "ImportedFrom";

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "discountCode" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reward_spaceId_key" ON "Reward"("spaceId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `sessionId` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "isSelected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ProductPhotographySession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPhotographySession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductPhotographySession" ADD CONSTRAINT "ProductPhotographySession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ProductPhotographySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

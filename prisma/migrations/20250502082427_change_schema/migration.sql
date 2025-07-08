/*
  Warnings:

  - You are about to drop the `_EmailCampaignToLead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EmailCampaignToLead" DROP CONSTRAINT "_EmailCampaignToLead_A_fkey";

-- DropForeignKey
ALTER TABLE "_EmailCampaignToLead" DROP CONSTRAINT "_EmailCampaignToLead_B_fkey";

-- DropTable
DROP TABLE "_EmailCampaignToLead";

-- CreateTable
CREATE TABLE "EmailLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "data" JSONB NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "emailContent" TEXT,
    "subject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmailCampaignToEmailLead" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmailCampaignToEmailLead_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmailCampaignToEmailLead_B_index" ON "_EmailCampaignToEmailLead"("B");

-- AddForeignKey
ALTER TABLE "_EmailCampaignToEmailLead" ADD CONSTRAINT "_EmailCampaignToEmailLead_A_fkey" FOREIGN KEY ("A") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailCampaignToEmailLead" ADD CONSTRAINT "_EmailCampaignToEmailLead_B_fkey" FOREIGN KEY ("B") REFERENCES "EmailLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

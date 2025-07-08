/*
  Warnings:

  - You are about to drop the `_EmailCampaignToEmailLead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EmailCampaignToEmailLead" DROP CONSTRAINT "_EmailCampaignToEmailLead_A_fkey";

-- DropForeignKey
ALTER TABLE "_EmailCampaignToEmailLead" DROP CONSTRAINT "_EmailCampaignToEmailLead_B_fkey";

-- DropTable
DROP TABLE "_EmailCampaignToEmailLead";

-- AddForeignKey
ALTER TABLE "EmailLead" ADD CONSTRAINT "EmailLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

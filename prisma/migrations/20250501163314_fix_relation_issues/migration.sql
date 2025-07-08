/*
  Warnings:

  - You are about to drop the column `context` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `emailType` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `failed` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `stats` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `successful` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `tone` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `totalEmails` on the `Campaign` table. All the data in the column will be lost.
  - The `status` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `assistantId` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactListId` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberId` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "speakFirstType" AS ENUM ('CLIENT', 'AGENT');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'PAUSED', 'FAILED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('OUTBOUND_CALLS', 'SMS', 'MIXED');

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "context",
DROP COLUMN "emailType",
DROP COLUMN "failed",
DROP COLUMN "stats",
DROP COLUMN "successful",
DROP COLUMN "tone",
DROP COLUMN "totalEmails",
ADD COLUMN     "assistantId" TEXT NOT NULL,
ADD COLUMN     "callsPerDay" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "completedContacts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contactListId" TEXT NOT NULL,
ADD COLUMN     "currentDayCallCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "endTime" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN     "failedContacts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCallDate" TIMESTAMP(3),
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "maxCallsPerDay" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "numberId" TEXT NOT NULL,
ADD COLUMN     "scheduleEnd" TIMESTAMP(3),
ADD COLUMN     "scheduleStart" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "startTime" TEXT NOT NULL DEFAULT '09:00',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "totalContacts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "CampaignType" NOT NULL DEFAULT 'OUTBOUND_CALLS',
DROP COLUMN "status",
ADD COLUMN     "status" "CampaignStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" DOUBLE PRECISION NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "companyName" TEXT,
    "speakFirst" "speakFirstType" NOT NULL DEFAULT 'AGENT',
    "systemPrompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "voice" TEXT NOT NULL DEFAULT 'Mark',
    "language" TEXT NOT NULL DEFAULT 'english',
    "temprature" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "maxCallDuration" INTEGER NOT NULL DEFAULT 180,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingCallConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomingCallConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "context" TEXT,
    "contactListId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contactList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallHistory" (
    "id" TEXT NOT NULL,
    "assistantName" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "customerName" TEXT,
    "customerNumber" TEXT NOT NULL,
    "callAnswered" BOOLEAN NOT NULL DEFAULT false,
    "callStartedAt" TIMESTAMP(3),
    "callEndedAt" TIMESTAMP(3),
    "callDuration" INTEGER,
    "callSummary" TEXT,
    "transcript" JSONB,
    "callSid" TEXT,
    "ultravoxCallId" TEXT,
    "shortSummary" TEXT,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "CallHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserCampaigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserCampaigns_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "IncomingCallConfig_userId_key" ON "IncomingCallConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_number_key" ON "PhoneNumber"("number");

-- CreateIndex
CREATE UNIQUE INDEX "CallHistory_callSid_key" ON "CallHistory"("callSid");

-- CreateIndex
CREATE UNIQUE INDEX "CallHistory_ultravoxCallId_key" ON "CallHistory"("ultravoxCallId");

-- CreateIndex
CREATE INDEX "_UserCampaigns_B_index" ON "_UserCampaigns"("B");

-- AddForeignKey
ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingCallConfig" ADD CONSTRAINT "IncomingCallConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingCallConfig" ADD CONSTRAINT "IncomingCallConfig_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_contactListId_fkey" FOREIGN KEY ("contactListId") REFERENCES "contactList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactList" ADD CONSTRAINT "contactList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_numberId_fkey" FOREIGN KEY ("numberId") REFERENCES "PhoneNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_contactListId_fkey" FOREIGN KEY ("contactListId") REFERENCES "contactList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignLog" ADD CONSTRAINT "CampaignLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallHistory" ADD CONSTRAINT "CallHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserCampaigns" ADD CONSTRAINT "_UserCampaigns_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserCampaigns" ADD CONSTRAINT "_UserCampaigns_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[eventId,reviewerId]` on the table `FeedbackLabel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId,reviewerId]` on the table `ReviewDecision` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `FeedbackLabel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ReviewDecision` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeedbackLabel" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ReviewDecision" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "AnomalyOutput_score_idx" ON "AnomalyOutput"("score");

-- CreateIndex
CREATE INDEX "EventItem_flagged_occurredAt_idx" ON "EventItem"("flagged", "occurredAt");

-- CreateIndex
CREATE INDEX "EventItem_source_eventType_idx" ON "EventItem"("source", "eventType");

-- CreateIndex
CREATE INDEX "FeedbackLabel_label_updatedAt_idx" ON "FeedbackLabel"("label", "updatedAt");

-- CreateIndex
CREATE INDEX "FeedbackLabel_reviewerId_updatedAt_idx" ON "FeedbackLabel"("reviewerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackLabel_eventId_reviewerId_key" ON "FeedbackLabel"("eventId", "reviewerId");

-- CreateIndex
CREATE INDEX "ModelPrediction_score_idx" ON "ModelPrediction"("score");

-- CreateIndex
CREATE INDEX "ReviewDecision_status_updatedAt_idx" ON "ReviewDecision"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "ReviewDecision_reviewerId_updatedAt_idx" ON "ReviewDecision"("reviewerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewDecision_eventId_reviewerId_key" ON "ReviewDecision"("eventId", "reviewerId");

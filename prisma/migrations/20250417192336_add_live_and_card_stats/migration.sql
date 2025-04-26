/*
  Warnings:

  - You are about to drop the column `playTime` on the `MatchPlayer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MatchPlayer" DROP COLUMN "playTime",
ADD COLUMN     "foulsCommitted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "foulsReceived" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recoveries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "redCards" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shotsOffTarget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shotsOnGoal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "starter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "yellowCards" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "totalFoulsCommitted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalFoulsReceived" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRecoveries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRedCards" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalShotsOffTarget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalShotsOnGoal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalYellowCards" INTEGER NOT NULL DEFAULT 0;

/*
  Warnings:

  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Test" ADD COLUMN "description" TEXT;
ALTER TABLE "Test" ADD COLUMN "priority" INTEGER;
ALTER TABLE "Test" ADD COLUMN "type" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Participant";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestParticipant";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TestResult" (
    "testId" TEXT NOT NULL PRIMARY KEY,
    "feedbackSummary" TEXT,
    "bugCount" INTEGER,
    "testedFeatures" TEXT,
    CONSTRAINT "TestResult_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participation" (
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "bugsReported" INTEGER NOT NULL,
    "feedback" TEXT,

    PRIMARY KEY ("userId", "testId"),
    CONSTRAINT "Participation_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AchievementType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "points" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "dateAwarded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "achievementId"),
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

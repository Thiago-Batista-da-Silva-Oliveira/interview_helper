-- CreateTable
CREATE TABLE "interview_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "communicationQuality" INTEGER,
    "depthOfKnowledge" INTEGER,
    "clarityScore" INTEGER,
    "avgResponseTime" INTEGER,
    "totalDuration" INTEGER,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "interview_analytics_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analyticsId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "category_scores_analyticsId_fkey" FOREIGN KEY ("analyticsId") REFERENCES "interview_analytics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "difficulty_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analyticsId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "difficulty_scores_analyticsId_fkey" FOREIGN KEY ("analyticsId") REFERENCES "interview_analytics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "avgScore" REAL NOT NULL,
    "totalInterviews" INTEGER NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "trend" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "avgScore" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "category_progress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "user_progress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_streaks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" DATETIME NOT NULL,
    CONSTRAINT "user_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_analytics_interviewId_key" ON "interview_analytics"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "category_scores_analyticsId_category_key" ON "category_scores"("analyticsId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "difficulty_scores_analyticsId_difficulty_key" ON "difficulty_scores"("analyticsId", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_month_key" ON "user_progress"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "category_progress_progressId_category_key" ON "category_progress"("progressId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_streaks_userId_key" ON "user_streaks"("userId");

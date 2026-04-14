-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "subscription_plan" TEXT NOT NULL DEFAULT 'free',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response_time" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiUsage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_api_key_key" ON "User"("api_key");

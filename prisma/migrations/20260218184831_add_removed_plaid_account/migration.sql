-- CreateTable
CREATE TABLE "RemovedPlaidAccount" (
    "id" SERIAL NOT NULL,
    "plaidAccountId" TEXT NOT NULL,
    "itemId" INTEGER,
    "userId" INTEGER,
    "reason" TEXT,
    "removedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RemovedPlaidAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RemovedPlaidAccount_plaidAccountId_idx" ON "RemovedPlaidAccount"("plaidAccountId");

-- CreateIndex
CREATE INDEX "RemovedPlaidAccount_itemId_idx" ON "RemovedPlaidAccount"("itemId");

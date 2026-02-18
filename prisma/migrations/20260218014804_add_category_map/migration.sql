-- CreateTable
CREATE TABLE "CategoryMap" (
    "id" SERIAL NOT NULL,
    "plaidCategory" TEXT NOT NULL,
    "appCategory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryMap_plaidCategory_key" ON "CategoryMap"("plaidCategory");

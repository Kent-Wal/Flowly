-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "appCategory" TEXT,
ADD COLUMN     "categoryHierarchy" JSONB,
ADD COLUMN     "plaidCategoryId" TEXT;

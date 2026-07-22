-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Novel" ADD COLUMN     "deletedAt" TIMESTAMP(3);

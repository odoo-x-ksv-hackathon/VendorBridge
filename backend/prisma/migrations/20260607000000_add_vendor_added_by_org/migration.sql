-- DropForeignKey (in case it exists from manual add)
ALTER TABLE "Vendor" DROP CONSTRAINT IF EXISTS "Vendor_addedByOrgId_fkey";

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN IF NOT EXISTS "addedByOrgId" TEXT;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_addedByOrgId_fkey" FOREIGN KEY ("addedByOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

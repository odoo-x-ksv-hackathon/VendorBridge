import { Router } from 'express';
import { registerVendor, getVendors } from '../controllers/vendorController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// POST /api/vendors - Create a new vendor
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'),
  registerVendor
);

// GET /api/vendors - Fetch list of all vendors
router.get(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'),
  getVendors
);

export default router;
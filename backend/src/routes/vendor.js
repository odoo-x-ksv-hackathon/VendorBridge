import { Router } from 'express';
import { registerVendor, getVendors, getVendorById } from '../controllers/vendorController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'), registerVendor);
router.get('/', authenticate, authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'), getVendors);
router.get('/:id', authenticate, authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'), getVendorById);

export default router;
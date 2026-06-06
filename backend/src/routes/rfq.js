import { Router } from 'express';
import { createRfq, getRfqs, getRfqById } from '../controllers/rfqController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// POST /api/rfqs - Create a new RFQ (Buyer Only)
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'),
  createRfq
);

// GET /api/rfqs - Get list of RFQs (Buyer & Vendor)
router.get(
  '/',
  authenticate,
  getRfqs
);

// GET /api/rfqs/:id - Get specific RFQ details
router.get(
  '/:id',
  authenticate,
  getRfqById
);

export default router;
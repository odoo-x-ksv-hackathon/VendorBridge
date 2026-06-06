import { Router } from 'express';
import { 
  submitQuotation, 
  reviseQuotation, 
  getQuotationsByRfq 
} from '../controllers/quotationController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// POST /api/quotations - Vendor submits initial quote
router.post(
  '/',
  authenticate,
  authorizeRoles('VENDOR'),
  submitQuotation
);

// PUT /api/quotations/:id - Vendor revises their quote based on negotiation
router.put(
  '/:id',
  authenticate,
  authorizeRoles('VENDOR'),
  reviseQuotation
);

// GET /api/quotations/rfq/:rfqId - Buyer fetches all quotes for an RFQ
router.get(
  '/rfq/:rfqId',
  authenticate,
  authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'),
  getQuotationsByRfq
);

export default router;
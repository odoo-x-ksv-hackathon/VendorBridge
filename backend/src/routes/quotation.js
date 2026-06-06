import { Router } from 'express';
import { 
  submitQuotation, 
  reviseQuotation, 
  getQuotationsByRfq,
  getQuotationById
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

// GET /api/quotations/:id - Buyer views a single quotation with approvals
router.get(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'),
  getQuotationById
);

// GET /api/quotations/rfq/:rfqId - Buyer fetches all quotes for an RFQ
router.get(
  '/rfq/:rfqId',
  authenticate,
  authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'),
  getQuotationsByRfq
);

// GET /api/quotations/my/:rfqId - Vendor fetches their own quote for an RFQ
router.get(
  '/my/:rfqId',
  authenticate,
  authorizeRoles('VENDOR'),
  async (req, res) => {
    try {
      const { prisma } = await import('../db.js');
      const vendor = await prisma.vendor.findUnique({ where: { orgId: req.user.orgId } });
      if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
      const quotation = await prisma.quotation.findFirst({
        where: { rfqId: req.params.rfqId, vendorId: vendor.id },
        include: { items: true },
      });
      res.json(quotation ?? null);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch quotation' });
    }
  }
);

export default router;
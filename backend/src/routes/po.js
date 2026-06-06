import { Router } from 'express';
import { generatePurchaseOrder, getPurchaseOrders } from '../controllers/poController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// POST /api/pos - Generate a new PO
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'),
  generatePurchaseOrder
);

// GET /api/pos - List all POs for the dashboard
router.get(
  '/',
  authenticate,
  getPurchaseOrders
);

export default router;
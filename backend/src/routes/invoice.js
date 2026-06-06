import { Router } from 'express';
import { generateInvoice, getInvoices } from '../controllers/invoiceController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// POST /api/invoices - Generate a new Invoice (Procurement Officer)
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'),
  generateInvoice
);

// GET /api/invoices - List all Invoices for the dashboard
router.get(
  '/',
  authenticate,
  getInvoices
);

export default router;
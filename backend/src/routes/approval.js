import { Router } from 'express';
import { processApproval } from '../controllers/approvalController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// POST /api/approvals - Manager approves or rejects a quote
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'MANAGER'), // Only decision-makers
  processApproval
);

export default router;
import { Router } from 'express';
import { createRfq, getRfqs, getRfqById } from '../controllers/rfqController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { uploadRfqAttachments } from '../middleware/upload.js';

const router = Router();

router.post('/', authenticate, authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'), uploadRfqAttachments, createRfq);
router.get('/', authenticate, getRfqs);
router.get('/:id', authenticate, getRfqById);

export default router;
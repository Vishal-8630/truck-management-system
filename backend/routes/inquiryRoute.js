import express from 'express';
import { createInquiry, getAllInquiries, updateInquiryStatus } from '../controllers/inquiryController.js';
// Should probably have some protection for getAllInquiries later, but for now keeping it simple

const router = express.Router();

router.post('/', createInquiry);
router.get('/', getAllInquiries);
router.patch('/:id', updateInquiryStatus);

export default router;

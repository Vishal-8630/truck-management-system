import express from 'express';
import { confirmSettlement, previewSettlement } from '../controllers/settlementController.js';

const router = express.Router();

router.get("/preview", previewSettlement);
router.post("/confirm", confirmSettlement);

export default router;
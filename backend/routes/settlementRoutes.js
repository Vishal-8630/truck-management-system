import express from 'express';
import { allSettlements, confirmSettlement, previewSettlement } from '../controllers/settlementController.js';

const router = express.Router();

router.get("", allSettlements);
router.get("/preview", previewSettlement);
router.post("/confirm", confirmSettlement);

export default router;
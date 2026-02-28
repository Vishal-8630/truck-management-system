import express from 'express';
import { allSettlements, confirmSettlement, previewSettlement, markSettled, unmarkSettled, recalculateSettlement } from '../controllers/settlementController.js';

const router = express.Router();

router.get("", allSettlements);
router.get("/preview", previewSettlement);
router.post("/confirm", confirmSettlement);
router.patch("/:id/mark-settled", markSettled);
router.patch("/:id/unmark-settled", unmarkSettled);
router.post("/:id/recalculate", recalculateSettlement);

export default router;
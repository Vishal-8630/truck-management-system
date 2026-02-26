import express from 'express';
import { ledgerValidation } from '../validators/ledgerValidator.js';
import { allLedgers, newLedger, updateLedger, deleteLedger } from '../controllers/ledgerController.js';

const router = express.Router();

router.post("/new", ledgerValidation, newLedger);
router.get("/all", allLedgers);
router.put("/update/:id", ledgerValidation, updateLedger);
router.delete("/delete/:id", deleteLedger);

export default router;
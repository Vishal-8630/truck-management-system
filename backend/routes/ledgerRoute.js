import express from 'express';
import { ledgerValidation } from '../validators/ledgerValidator.js';
import { allLedgers, newLedger, updateLedger } from '../controllers/ledgerController.js';

const router = express.Router();

router.post("/new", ledgerValidation, newLedger);
router.get("/all", allLedgers);
router.put("/update/:id", ledgerValidation, updateLedger);

export default router;
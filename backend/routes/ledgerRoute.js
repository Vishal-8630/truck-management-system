import express from 'express';
import { ledgerValidation } from '../validators/ledgerValidator.js';
import { newLedger } from '../controllers/ledgerController.js';

const router = express.Router();

router.post("/new", ledgerValidation, newLedger);


export default router;
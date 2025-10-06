import express from 'express';
import { getAllBalanceParties, newBalanceParty, updateBalanceParty } from '../controllers/balancePartyController.js';
import { balancePartyValidations } from '../validators/balancePartyValidator.js';

const router = express.Router();

router.post('/new', balancePartyValidations, newBalanceParty);
router.get('/all', getAllBalanceParties);
router.put('/update/:id', balancePartyValidations, updateBalanceParty);

export default router;
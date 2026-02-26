import express from 'express';
import { createQuote, getAllQuotes, updateQuoteStatus } from '../controllers/quoteController.js';

const router = express.Router();

router.post('/', createQuote);
router.get('/', getAllQuotes);
router.patch('/:id', updateQuoteStatus);

export default router;

import express from 'express';
import { allJournies, newJourney } from '../controllers/truckJourneyController.js';

const router = express.Router();

router.post("/new", newJourney);
router.get("/all", allJournies);

export default router;
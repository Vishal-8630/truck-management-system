import express from 'express';
import { allJournies, deleteJourney, newJourney, updateJourney } from '../controllers/truckJourneyController.js';

const router = express.Router();

router.post("/new", newJourney);
router.get("/all", allJournies);
router.put("/update/:id", updateJourney)
router.delete("/delete/:id", deleteJourney);

export default router;
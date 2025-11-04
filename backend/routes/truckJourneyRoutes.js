import express from 'express';
import { allJournies, deleteJourney, newJourney, updateJourney } from '../controllers/truckJourneyController.js';
import { truckJourneyValidation } from '../validators/truckJourneyValidator.js';

const router = express.Router();

router.post("/new", truckJourneyValidation, newJourney);
router.get("/all", allJournies);
router.put("/update/:id", updateJourney)
router.delete("/delete/:id", deleteJourney);

export default router;
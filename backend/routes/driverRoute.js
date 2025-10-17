import express from 'express';
import { allDrivers, newDriver } from '../controllers/driverController.js';

const router = express.Router();

router.post("/new", newDriver);
router.get("/all", allDrivers);


export default router;
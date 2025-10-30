import express from 'express';
import { allTrucks, deleteTruck, newTruck, updateTruck } from '../controllers/truckController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

const truckUploads = upload.fields([
    { name: "fitness_doc", maxCount: 1 },
    { name: "insurance_doc", maxCount: 1 },
    { name: "national_permit_doc", maxCount: 1 },
    { name: "state_permit_doc", maxCount: 1 },
    { name: "tax_doc", maxCount: 1 },
    { name: "pollution_doc", maxCount: 1 }
])

router.post("/new", truckUploads, newTruck);
router.get("/all", allTrucks);
router.put("/update/:id", truckUploads, updateTruck);
router.delete("/delete/:id", deleteTruck);


export default router;
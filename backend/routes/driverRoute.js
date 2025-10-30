import express from 'express';
import { allDrivers, deleteDriver, newDriver, updateDriver } from '../controllers/driverController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

const driverUploads = upload.fields([
  { name: "driver_img", maxCount: 1 },
  { name: "adhaar_front_img", maxCount: 1 },
  { name: "adhaar_back_img", maxCount: 1 },
  { name: "dl_img", maxCount: 1 },
]);

router.post("/new", driverUploads, newDriver);
router.get("/all", allDrivers);
router.put("/update/:id", driverUploads, updateDriver);
router.delete("/delete/:id", deleteDriver);


export default router;
import express from "express";
import { trackShipment } from "../controllers/trackingController.js";

const router = express.Router();

router.get("/:lr_no", trackShipment);

export default router;

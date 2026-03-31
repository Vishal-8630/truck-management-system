import express from "express";
import { getEntityHistory } from "../controllers/historyController.js";

const router = express.Router();

router.get("/:entityType/:entityId", getEntityHistory);

export default router;

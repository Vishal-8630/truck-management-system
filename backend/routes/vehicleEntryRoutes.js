import express from "express";
import {
  addNewVehicleEntry,
  getAllVehicleEntries,
  searchVehicleEntryByParty,
  updateVehicleEntry,
} from "../controllers/vehicleEntryController.js";
import { vehicleEntryValidation } from "../validators/vehicleEntryValidator.js";

const router = express.Router();

router.post("/new", vehicleEntryValidation, addNewVehicleEntry);
router.get("/all", getAllVehicleEntries);
router.get("/by-party/:id", searchVehicleEntryByParty);
router.put(
  "/update/:id",
  vehicleEntryValidation,
  updateVehicleEntry
);

export default router;

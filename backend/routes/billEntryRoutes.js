import express from "express";
import {
  addNewBillingEntry,
  findBillingEntryById,
  getAllBillingEntries,
  searchBillingEntryByParam,
  updateBillingEntry,
} from "../controllers/billEntryController.js";
import { billingEntryValidations } from "../validators/billEntryValidator.js";

const router = express.Router();

router.post("/new", billingEntryValidations, addNewBillingEntry);
router.get("/all", getAllBillingEntries);
router.put(
  "/update/:id",
  billingEntryValidations,
  updateBillingEntry
);

// Need to remove it and it's controller.
router.get("/search/by-param/", searchBillingEntryByParam);

// Need to remove the route and its controller.
router.get("/search/by-id/:id", findBillingEntryById);

export default router;

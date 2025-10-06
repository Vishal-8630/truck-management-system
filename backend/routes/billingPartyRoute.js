import express from "express";
import {
  newBillingParty,
  getAllBillingParties,
  updateBillingParty,
  getBillingPartyByName,
} from "../controllers/billingPartyController.js";
import { billingPartyValidations } from "../validators/billingPartyValidator.js";

const router = express.Router();

router.post("/new", billingPartyValidations, newBillingParty);
router.get("/all", getAllBillingParties);
router.put(
  "/update/:id",
  billingPartyValidations,
  updateBillingParty
);
router.get("/by-name/:name", getBillingPartyByName);

export default router;

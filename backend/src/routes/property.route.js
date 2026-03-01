import { Router } from "express";
import { getPropertyDetails } from "../controllers/property.controller.js";

const router = Router();

router.get("/:municipality/get-property-details", getPropertyDetails);

export default router;
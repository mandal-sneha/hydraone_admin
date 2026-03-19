import { Router } from "express";
import { getDashboardContent, getFamilyDetails, getWaterRegistrationDetailsForToday, getFamilyMonthlyUsageDetails } from "../controllers/property.controller.js";

const router = Router();

router.get("/:areatype/:area/get-dashboard-content", getDashboardContent);
router.get("/:waterid/get-family-details", getFamilyDetails);
router.get("/:waterid/get-water-registration-details-for-today", getWaterRegistrationDetailsForToday);
router.get("/:waterid/get-family-monthly-usage-details", getFamilyMonthlyUsageDetails);

export default router;
import { Router } from "express";
import { getPendingWaterRequests, getWaterRequestDetails, approveWaterRequest, rejectWaterRequest } from "../controllers/waterregistration.controller.js";
import { protectAdminKey } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/pending", protectAdminKey, getPendingWaterRequests);
router.get("/:requestId", protectAdminKey, getWaterRequestDetails);
router.put("/:requestId/approve", protectAdminKey, approveWaterRequest);
router.put("/:requestId/reject", protectAdminKey, rejectWaterRequest);

export default router;
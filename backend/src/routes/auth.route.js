import { Router } from "express";
import { verifyAdminKey } from "../controllers/auth.controller.js";

const router = Router();

router.post("/verify-admin-key", verifyAdminKey);

export default router;
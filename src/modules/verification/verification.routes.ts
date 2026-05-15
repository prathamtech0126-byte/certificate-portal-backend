import { Router } from "express";
import { publicReadRateLimiter } from "../../shared/middlewares/security.middleware";
import { verifyPublic } from "./verification.controller";

const router = Router();

/** Public: no JWT. Rate-limited. Logs every successful lookup to `verification_logs`. */
router.get("/verify/:publicStudentId", publicReadRateLimiter, verifyPublic);

export default router;

import { Router } from "express";
import { leadRateLimiter } from "../../shared/middlewares/security.middleware";
import { submitContact } from "./contact.controller";

const router = Router();

/** Public: no JWT. Rate-limited to reduce spam. */
router.post("/contact", leadRateLimiter, submitContact);

export default router;

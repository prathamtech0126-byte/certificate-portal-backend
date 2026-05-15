import { Router } from "express";
import { apiRateLimiter, publicReadRateLimiter } from "../../shared/middlewares/security.middleware";
import { requireAdminOrHr, requireJwtAuth } from "../../shared/middlewares/jwt-auth.middleware";
import { verifyPublic } from "../verification/verification.controller";
import { optionalStudentCertificateUpload } from "./students.middleware/multer-certificate";
import { createStudent, getStudentById, listStudents } from "./students.controller";

const router = Router();

router.post(
  "/students",
  requireJwtAuth,
  requireAdminOrHr,
  apiRateLimiter,
  optionalStudentCertificateUpload,
  createStudent
);
router.get("/students", requireJwtAuth, requireAdminOrHr, publicReadRateLimiter, listStudents);
/** Public: lookup by verification code, log check, return safe profile + certificate paths (same as `GET /api/verify/:publicStudentId`). */
router.get("/students/by-verification-id/:publicStudentId", publicReadRateLimiter, verifyPublic);
router.get("/students/:id", requireJwtAuth, requireAdminOrHr, publicReadRateLimiter, getStudentById);

export default router;

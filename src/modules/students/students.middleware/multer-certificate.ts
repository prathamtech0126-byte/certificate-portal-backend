import fs from "fs";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { AppError } from "../../../shared/utils/errors/AppError";

/** Public static root (served at `/uploads`). */
export const UPLOADS_PUBLIC_ROOT = path.join(process.cwd(), "uploads");

const TMP_UPLOAD_ROOT = path.join(process.cwd(), ".tmp", "certificate-uploads");

const ALLOWED_EXT = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp"]);

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

ensureDir(TMP_UPLOAD_ROOT);

export const certificateUpload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      ensureDir(TMP_UPLOAD_ROOT);
      cb(null, TMP_UPLOAD_ROOT);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase() || ".bin";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 12)}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      cb(new AppError("Only PDF, PNG, JPG, JPEG, or WEBP uploads are allowed", 400));
      return;
    }
    cb(null, true);
  },
});

/** Only runs Multer when body is multipart (optional file field `certificate`). JSON requests skip this. */
export function optionalStudentCertificateUpload(req: Request, res: Response, next: NextFunction): void {
  const ct = String(req.headers["content-type"] || "");
  if (ct.includes("multipart/form-data")) {
    certificateUpload.single("certificate")(req, res, next);
    return;
  }
  next();
}

import fs from "fs/promises";
import path from "path";
import { randomBytes, randomUUID } from "crypto";
import { AppError } from "../../shared/utils/errors/AppError";
import { UPLOADS_PUBLIC_ROOT } from "./students.middleware/multer-certificate";
import type { StudentRow } from "./students.repository";
import { studentsRepository } from "./students.repository";
import type { CreateStudentInput } from "./students.validation";

function generateCandidatePublicId(): string {
  return `VP-${randomBytes(5).toString("hex").toUpperCase()}`;
}

export type UploadedCertFile = {
  tempPath: string;
  originalname: string;
};

export const studentsService = {
  async create(
    input: CreateStudentInput,
    createdByUserId: string,
    certificateFile?: UploadedCertFile
  ): Promise<StudentRow> {
    let publicId = input.studentId?.trim();
    if (publicId) {
      if (await studentsRepository.existsPublicStudentId(publicId)) {
        throw new AppError("Verification ID already in use", 409);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const candidate = generateCandidatePublicId();
        if (!(await studentsRepository.existsPublicStudentId(candidate))) {
          publicId = candidate;
          break;
        }
      }
      if (!publicId) {
        throw new AppError("Could not allocate verification ID", 503);
      }
    }

    const id = randomUUID();
    let certificateUrl: string | null = null;
    let tempPath = certificateFile?.tempPath;

    try {
      if (certificateFile) {
        const destDir = path.join(UPLOADS_PUBLIC_ROOT, id);
        await fs.mkdir(destDir, { recursive: true });
        const ext = path.extname(certificateFile.originalname) || "";
        const rawBase = path.basename(certificateFile.originalname, ext);
        const safeBase = rawBase.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80) || "certificate";
        const finalName = `${Date.now()}-${safeBase}${ext.toLowerCase() || ".bin"}`;
        const finalAbs = path.join(destDir, finalName);
        await fs.rename(certificateFile.tempPath, finalAbs);
        tempPath = undefined;
        certificateUrl = `/uploads/${id}/${finalName}`;
      }

      return await studentsRepository.create({
        id,
        studentId: publicId,
        fullName: input.fullName.trim(),
        mobile: input.mobile?.trim() || null,
        email: input.email?.trim() || null,
        courseName: input.courseName?.trim() || null,
        instituteName: input.instituteName?.trim() || null,
        isVerified: input.isVerified ?? true,
        createdBy: createdByUserId,
        certificateUrl,
      });
    } catch (err) {
      if (tempPath) {
        await fs.unlink(tempPath).catch(() => {});
      }
      if (certificateUrl) {
        const dir = path.join(UPLOADS_PUBLIC_ROOT, id);
        await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
      }
      throw err;
    }
  },

  async getById(id: string): Promise<StudentRow> {
    const row = await studentsRepository.findById(id);
    if (!row) throw new AppError("Student not found", 404);
    return row;
  },

  async list(limit = 100): Promise<StudentRow[]> {
    return studentsRepository.list(Math.min(Math.max(limit, 1), 500));
  },
};

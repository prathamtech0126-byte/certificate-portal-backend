import fs from "fs/promises";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/utils/errors/AppError";
import { createStudentSchema } from "./students.validation";
import { studentsService } from "./students.service";

export async function createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.adminUser) {
      next(new AppError("Unauthorized", 401));
      return;
    }
    const payload = createStudentSchema.parse(req.body);
    const certificateFile =
      req.file != null
        ? { tempPath: req.file.path, originalname: req.file.originalname }
        : undefined;
    const student = await studentsService.create(payload, req.adminUser.userId, certificateFile);
    res.status(201).json({ ok: true, student });
  } catch (err) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(err);
  }
}

export async function listStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const students = await studentsService.list(Number.isFinite(limit) ? limit : 100);
    res.status(200).json({ ok: true, students });
  } catch (err) {
    next(err);
  }
}

export async function getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
    const student = await studentsService.getById(id);
    res.status(200).json({ ok: true, student });
  } catch (err) {
    next(err);
  }
}

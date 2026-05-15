import type { NextFunction, Request, Response } from "express";
import { getClientIp } from "../../shared/utils/client-ip";
import { verificationService } from "./verification.service";

export async function verifyPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const publicStudentId =
      typeof req.params.publicStudentId === "string"
        ? req.params.publicStudentId
        : req.params.publicStudentId?.[0] ?? "";
    const ip = getClientIp(req);
    const result = await verificationService.verifyAndLog(publicStudentId, ip);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
}

import type { NextFunction, Request, Response } from "express";
import { getClientIp } from "../../shared/utils/client-ip";
import { createContactSchema } from "./contact.validation";
import { contactService } from "./contact.service";

export async function submitContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = createContactSchema.parse(req.body);
    const ip = getClientIp(req);
    const { id } = await contactService.submit(payload, ip);
    res.status(201).json({
      ok: true,
      message: "Your enquiry has been received. We will get back to you soon.",
      enquiryId: id,
    });
  } catch (err) {
    next(err);
  }
}

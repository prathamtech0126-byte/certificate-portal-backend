import { randomUUID } from "crypto";
import { sanitizeEmail, sanitizeMultilineText, sanitizeText } from "../../shared/utils/sanitize";
import { contactRepository } from "./contact.repository";
import type { CreateContactInput } from "./contact.validation";

export const contactService = {
  async submit(input: CreateContactInput, ipAddress: string | null): Promise<{ id: string }> {
    const id = randomUUID();

    await contactRepository.create({
      id,
      fullName: sanitizeText(input.fullName),
      email: sanitizeEmail(input.email),
      subject: input.subject ? sanitizeText(input.subject) : null,
      message: sanitizeMultilineText(input.message),
      ipAddress,
    });

    return { id };
  },
};

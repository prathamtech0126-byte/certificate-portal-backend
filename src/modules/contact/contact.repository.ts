import type { Pool } from "pg";
import { getPool } from "../../shared/db/postgres";

function pool(): Pool {
  return getPool();
}

export type ContactEnquiryRow = {
  id: string;
  fullName: string;
  email: string;
  subject: string | null;
  message: string;
  ipAddress: string | null;
  createdAt: Date;
};

const CONTACT_COLUMNS = `id, "fullName", email, subject, message, "ipAddress", "createdAt"`;

export const contactRepository = {
  async create(input: {
    id: string;
    fullName: string;
    email: string;
    subject: string | null;
    message: string;
    ipAddress: string | null;
  }): Promise<ContactEnquiryRow> {
    const result = await pool().query<ContactEnquiryRow>(
      `INSERT INTO contact_enquiries (id, "fullName", email, subject, message, "ipAddress")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${CONTACT_COLUMNS}`,
      [input.id, input.fullName, input.email, input.subject, input.message, input.ipAddress]
    );
    const row = result.rows[0];
    if (!row) throw new Error("Failed to create contact enquiry");
    return row;
  },
};

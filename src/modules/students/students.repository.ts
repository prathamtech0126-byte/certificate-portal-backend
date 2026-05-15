import type { Pool } from "pg";
import { randomUUID } from "crypto";
import { getPool } from "../../shared/db/postgres";

function pool(): Pool {
  return getPool();
}

export type StudentRow = {
  id: string;
  studentId: string;
  fullName: string;
  mobile: string | null;
  email: string | null;
  courseName: string | null;
  instituteName: string | null;
  isVerified: boolean;
  createdBy: string;
  certificateUrl: string | null;
  createdAt: Date;
};

const STUDENT_COLUMNS = `id, "studentId", "fullName", mobile, email, "courseName", "instituteName", "isVerified", "createdBy", "certificateUrl", "createdAt"`;

export const studentsRepository = {
  async findByPublicStudentId(publicStudentId: string): Promise<StudentRow | null> {
    const result = await pool().query<StudentRow>(
      `SELECT ${STUDENT_COLUMNS}
       FROM students
       WHERE "studentId" = $1
       LIMIT 1`,
      [publicStudentId]
    );
    const row = result.rows[0];
    return row ?? null;
  },

  async findById(id: string): Promise<StudentRow | null> {
    const result = await pool().query<StudentRow>(
      `SELECT ${STUDENT_COLUMNS}
       FROM students
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  async existsPublicStudentId(publicStudentId: string): Promise<boolean> {
    const result = await pool().query<{ c: string }>(
      `SELECT 1 AS c FROM students WHERE "studentId" = $1 LIMIT 1`,
      [publicStudentId]
    );
    return Boolean(result.rows[0]);
  },

  async list(limit: number): Promise<StudentRow[]> {
    const result = await pool().query<StudentRow>(
      `SELECT ${STUDENT_COLUMNS}
       FROM students
       ORDER BY "createdAt" DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  async create(input: {
    id: string;
    studentId: string;
    fullName: string;
    mobile: string | null;
    email: string | null;
    courseName: string | null;
    instituteName: string | null;
    isVerified: boolean;
    createdBy: string;
    certificateUrl: string | null;
  }): Promise<StudentRow> {
    const result = await pool().query<StudentRow>(
      `INSERT INTO students (id, "studentId", "fullName", mobile, email, "courseName", "instituteName", "isVerified", "createdBy", "certificateUrl")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${STUDENT_COLUMNS}`,
      [
        input.id,
        input.studentId,
        input.fullName,
        input.mobile,
        input.email,
        input.courseName,
        input.instituteName,
        input.isVerified,
        input.createdBy,
        input.certificateUrl,
      ]
    );
    const row = result.rows[0];
    if (!row) throw new Error("Failed to create student");
    return row;
  },
};

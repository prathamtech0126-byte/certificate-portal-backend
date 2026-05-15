import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/* =========================
   USERS
========================= */

export const roleEnum = pgEnum("Role", ["ADMIN", "HR"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  password: text("password").notNull(),

  role: roleEnum("role").notNull().default("ADMIN"),

  isActive: boolean("isActive").notNull().default(true),

  createdAt: timestamp("createdAt").defaultNow().notNull(),

  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/* =========================
   REFRESH TOKENS
========================= */

export const refreshTokens = pgTable("refresh_tokens", {
  id: text("id").primaryKey(),

  userId: text("userId")
    .notNull()
    .references(() => users.id),

  tokenHash: text("tokenHash").notNull().unique(),

  expiresAt: timestamp("expiresAt").notNull(),

  revoked: boolean("revoked").default(false).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* =========================
   STUDENTS
========================= */

export const students = pgTable(
  "students",
  {
    id: text("id").primaryKey(),

    studentId: text("studentId").notNull(), // UNIQUE VERIFICATION ID

    fullName: text("fullName").notNull(),

    mobile: text("mobile"),

    email: text("email"),

    courseName: text("courseName"),

    instituteName: text("instituteName"),

    isVerified: boolean("isVerified").default(true).notNull(),

    createdBy: text("createdBy")
      .notNull()
      .references(() => users.id),

    /** Stored file path served under `/uploads/...` (set when a certificate is uploaded with the student). */
    certificateUrl: text("certificateUrl"),

    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    studentIdUnique: unique().on(table.studentId),
  })
);

/* =========================
 LOGS
========================= */

export const verificationLogs = pgTable("verification_logs", {
  id: text("id").primaryKey(),

  studentId: text("studentId")
    .notNull()
    .references(() => students.id),

  checkedAt: timestamp("checkedAt").defaultNow().notNull(),

  ipAddress: text("ipAddress"),
});
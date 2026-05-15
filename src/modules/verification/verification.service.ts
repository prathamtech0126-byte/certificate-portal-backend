import { AppError } from "../../shared/utils/errors/AppError";
import { studentsRepository } from "../students/students.repository";
import { verificationLogsRepository } from "./verification.repository";

export type PublicCertificateItem = {
  id: string;
  /** Public URL path — open as `GET {origin}{certificateUrl}`. */
  certificateUrl: string;
  createdAt: Date;
};

export type PublicVerificationResult = {
  verified: boolean;
  fullName: string;
  courseName: string | null;
  instituteName: string | null;
  /** Public verification code (same as URL segment). */
  verificationId: string;
  /** Single certificate on the student row (empty array if none). */
  certificates: PublicCertificateItem[];
};

export const verificationService = {
  /**
   * Third-party lookup by public verification ID (`students.studentId`).
   * Always appends a row to `verification_logs` when the student exists.
   */
  async verifyAndLog(publicStudentId: string, ipAddress: string | null): Promise<PublicVerificationResult> {
    const trimmed = publicStudentId.trim();
    if (!trimmed) {
      throw new AppError("Verification ID required", 400);
    }

    const student = await studentsRepository.findByPublicStudentId(trimmed);
    if (!student) {
      throw new AppError("Student not found", 404);
    }

    await verificationLogsRepository.insert({
      studentInternalId: student.id,
      ipAddress: ipAddress,
    });

    const certificates: PublicCertificateItem[] = [];
    if (student.certificateUrl) {
      certificates.push({
        id: `${student.id}-certificate`,
        certificateUrl: student.certificateUrl,
        createdAt: student.createdAt,
      });
    }

    return {
      verified: student.isVerified,
      fullName: student.fullName,
      courseName: student.courseName,
      instituteName: student.instituteName,
      verificationId: student.studentId,
      certificates,
    };
  },
};

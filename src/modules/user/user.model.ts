export const USER_ROLES = ["ADMIN", "HR"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = Omit<UserRecord, "password">;

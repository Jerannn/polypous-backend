import { z } from "zod";
import { registerSchema } from "../schemas/auth.schema.js";

export type Register = z.infer<typeof registerSchema>;

export type User = {
  readonly id: string;
  fullName: string;
  email: string;
  passwordHash: string | undefined;
  currency: string;
  avatarUrl: string | null;
  publicId: string | null;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  passwordResetToken: string | undefined;
  passwordResetExpiresAt: Date | undefined;
  isActive: boolean;
  lastLoginAt: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type UserWithoutSensitive = Omit<
  User,
  "passwordHash" | "passwordResetToken" | "passwordResetExpiresAt"
>;

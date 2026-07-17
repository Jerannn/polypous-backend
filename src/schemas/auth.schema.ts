import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(1, { message: "Full name is required" }),
    email: z
      .email({ message: "Please enter a valid email address" })
      .transform((val) => val.toLowerCase().trim()),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
});

export const resetPasswordSchema = z
  .object({
    email: z
      .email({ message: "Please enter a valid email address" })
      .transform((val) => val.toLowerCase().trim()),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
    confirmNewPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters long"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

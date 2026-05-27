import { z } from "zod";

export const verifySchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export const resendOtpSchema = z.object({
  action: z.enum(["register", "reset", "login"], "Please select a valid action"),
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
});

export const getOtpSchema = z.object({
  action: z.enum(["register", "reset", "login"], "Please select a valid action"),
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
});

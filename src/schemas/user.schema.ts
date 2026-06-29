import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  currency: z.string().min(1, { message: "Currency is required" }).max(3, "Currency is too long"),
});

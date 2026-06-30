import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  currency: z.string().min(1, { message: "Currency is required" }).max(3, "Currency is too long"),
});

export const businessSchema = z.object({
  name: z.string().min(1, { message: "Business name is required" }),
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  address: z.string().min(1, { message: "Business address is required" }),
  phone: z.string().min(1, { message: "Business phone is required" }),
});

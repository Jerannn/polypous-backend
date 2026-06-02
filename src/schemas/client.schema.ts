import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../utils/constants.js";

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must not exceed 255 characters"),
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce
    .number()
    .min(1)
    .max(MAX_PAGE_SIZE, `Limit must not exceed ${DEFAULT_PAGE_SIZE}`)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().optional().default(""),
});

export const clientParamsSchema = z.object({
  id: z.uuid("Invalid UUID format for client id"),
});

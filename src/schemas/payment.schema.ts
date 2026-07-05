import { z } from "zod";

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../utils/constants.js";

export const recordPaymentSchema = z.object({
  amount: z
    .number("Payment amount is required")
    .nonnegative("Amount cannot be negative")
    .transform((val) => parseFloat(val.toFixed(2))),
  paymentMethod: z.string().trim().min(1, "Payment method is required"),
  referenceNumber: z.string().trim().max(255).optional(),
  paymentDate: z.coerce.date<Date>().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const paymentIdParamsSchema = z.object({
  id: z.uuid("Invalid invoice id"),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce
    .number()
    .min(1)
    .max(MAX_PAGE_SIZE, `Limit must not exceed ${DEFAULT_PAGE_SIZE}`)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().optional().default(""),
});

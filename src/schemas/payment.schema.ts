import { z } from "zod";

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

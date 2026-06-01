import { z } from "zod";

const invoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  quantity: z
    .number("Quantity is required")
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
  unitPrice: z.number("Unit price is required").nonnegative("Unit price cannot be negative"),
});

export const invoiceSchema = z
  .object({
    clientId: z.uuid("Invalid client selected"),
    taxRate: z
      .number()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100")
      .default(0),
    issueDate: z.coerce.date("Issue date is required"),
    dueDate: z.coerce.date("Due date is required"),
    notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional(),

    items: z.array(invoiceItemSchema).min(1, "At least one invoice item is required"),
  })
  .refine((data) => data.dueDate > data.issueDate, {
    path: ["dueDate"],
    message: "Due date must be after issue date",
  });

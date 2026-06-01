import { z } from "zod";
import { invoiceSchema } from "../schemas/invoice.schema.js";

export type InvoiceStatus = "PAID" | "UNPAID" | "OVERDUE" | "CANCELLED";

export type InvoiceBase = z.infer<typeof invoiceSchema>;
export type InvoicePayload = Omit<InvoiceBase, "items"> & {
  userId: string;
  subtotal: number;
  total: number;
};
export type InvoiceItemsPayload = InvoiceBase["items"];
export type Invoice = InvoicePayload & {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  total: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

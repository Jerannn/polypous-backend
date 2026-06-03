import { z } from "zod";
import { invoiceSchema } from "../schemas/invoice.schema.js";

export type InvoiceStatus = "PAID" | "UNPAID" | "OVERDUE" | "CANCELLED";

export type InvoiceBase = z.infer<typeof invoiceSchema>;
export type InvoicePayload = Omit<InvoiceBase, "items"> & {
  userId: string;
  subtotal: number;
  total: number;
  invoiceNumber: string;
};
export type InvoiceItemsPayload = InvoiceBase["items"];
export type Invoice = Omit<InvoiceBase, "clientId"> & {
  id: string;
  invoiceNumber: string;
  clientName: string;
  status: InvoiceStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
};

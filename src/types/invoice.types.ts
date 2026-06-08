import { z } from "zod";
import { invoiceItemSchema, invoiceSchema } from "../schemas/invoice.schema.js";

export type InvoiceStatus = "PAID" | "UNPAID" | "OVERDUE" | "CANCELLED";

export type InvoiceInput = Omit<z.infer<typeof invoiceSchema>, "items"> & {
  userId: string;
  subtotal: number;
  total: number;
  invoiceNumber: string;
};
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export type Invoice = {
  id: string;
  userId: string;

  invoiceNumber: string;

  issueDate: Date;
  dueDate: Date;

  notes?: string;

  status: InvoiceStatus;

  subtotal: number;
  tax: number;
  total: number;

  createdAt: Date;
  updatedAt: Date;
};
export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type InvoiceClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type InvoiceListItem = Invoice & { clientName: string; totalCount: number };
export type InvoiceWithItemsAndClient = Invoice & {
  client: InvoiceClient;
  items: InvoiceItem[];
  fullName: string;
  email: string;
};

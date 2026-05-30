import { z } from "zod";
import { invoiceSchema } from "../schemas/invoice.schema.js";

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItemsPayload = Invoice["items"];
export type InvoicePayload = Omit<Invoice, "items"> & { userId: string };

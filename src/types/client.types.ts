import { z } from "zod";

import { clientSchema } from "../schemas/client.schema.js";

export type ClientPayload = z.infer<typeof clientSchema>;

export type Client = ClientPayload & {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientWithAnalytics = Client & {
  invoiceHistory: InvoiceHistory[];
  invoiceNumber: string;
  invoiceCount: number;
  totalPaid: number;
  totalUnpaid: number;
  totalCount: number;
};

type InvoiceHistory = {
  invoiceNumber: string;
  status: string;
  dueDate: string;
  total: number;
};

export type Options = {
  id: string;
  name: string;
  createdAt: string;
};

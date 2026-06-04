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
  invoiceCount: number;
  totalPaid: number;
  totalUnpaid: number;
  totalCount: number;
};

export type Options = {
  id: string;
  name: string;
  createdAt: string;
};

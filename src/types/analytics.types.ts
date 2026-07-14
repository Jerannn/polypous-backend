import { z } from "zod";

import { filterSchema } from "../schemas/analytics.schema.js";

export type AnalyticsFilter = z.infer<typeof filterSchema>;

export type IncomeTrend = {
  period: string;
  total: string;
};

export type InvoiceStatus = {
  status: string;
  count: number;
};

type StatValues = {
  current: number;
  previous: number;
  growth: number;
};

export type Stats = {
  revenue: StatValues;
  outstanding: StatValues;
  clients: StatValues;
  invoices: StatValues;
};

export type TopClient = { name: string; revenue: number };

export type Analytics = {
  stats: Stats;
  incomeTrend: IncomeTrend[];
  invoiceStatus: InvoiceStatus[];
  topClients: TopClient[];
};

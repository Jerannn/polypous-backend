import { z } from "zod";

import { recordPaymentSchema } from "../schemas/payment.schema.js";

export type PaymentInput = z.infer<typeof recordPaymentSchema>;

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date | string;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentListItem = {
  id: string;
  paymentDate: Date | string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  totalCount: number;
};

export type PaymentStats = {
  totalRevenue: string;
  monthlyRevenue: string;
  totalPayments: string;
  averagePayment: string;
};

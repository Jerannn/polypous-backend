import { z } from "zod";
import { recordPaymentSchema } from "../schemas/payment.schema.js";

export type PaymentInput = z.infer<typeof recordPaymentSchema>;

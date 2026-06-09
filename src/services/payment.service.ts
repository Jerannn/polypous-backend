import { Request } from "express";
import { PaymentInput } from "../types/payment.types.js";
import PaymentModel from "../models/payment.model.js";

export default class PaymentService {
  static async handleCreatePayment(req: Request) {
    const payload = req.body as PaymentInput;
    const userId = req.user.id;
    const invoiceId = req.params.id as string;

    const newPayment = await PaymentModel.insert(userId, invoiceId, payload);

    return newPayment;
  }
}

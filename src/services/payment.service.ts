import { Request } from "express";

import db from "../config/db.js";
import PaymentModel from "../models/payment.model.js";
import { PaymentInput } from "../types/payment.types.js";

export default class PaymentService {
  static async handleCreatePayment(req: Request) {
    const payload = req.body as PaymentInput;
    const userId = req.user.id;
    const invoiceId = req.params.id as string;

    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      const newPayment = await PaymentModel.insert(client, userId, invoiceId, payload);

      await PaymentModel.updateStatus(client, invoiceId);

      await client.query("COMMIT");

      return { ...newPayment, amount: Number(newPayment.amount) };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async handleGetAllPayments(req: Request) {
    const userId = req.user.id;
    const { page, limit, search } = req.validatedQuery;

    const parsedLimit = Number(limit);
    const parsedPage = Number(page);

    const offset = (parsedPage - 1) * parsedLimit;

    const payments = await PaymentModel.findAllByUserId(
      userId,
      parsedLimit,
      offset,
      search as string
    );

    const total = payments[0]?.totalCount ?? 0;
    const totalPage = Math.ceil(total / parsedLimit);

    const paymentData = payments.map(({ totalCount, ...payment }) => ({
      ...payment,
      amount: Number(payment.amount),
    }));

    return {
      meta: {
        limit,
        total,
        totalPage,
        currentPage: parsedPage,
        nextPage: parsedPage < totalPage ? parsedPage + 1 : null,
        prevPage: parsedPage > 1 ? parsedPage - 1 : null,
      },
      payments: paymentData,
    };
  }

  static async handleGetPaymentStats(userId: string) {
    return await PaymentModel.findPaymentsByUserId(userId);
  }
}

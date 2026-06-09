import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { PaymentInput } from "../types/payment.types.js";

export default class PaymentModel {
  static async insert(userId: string, invoiceId: string, payload: PaymentInput) {
    const { amount, paymentMethod, referenceNumber, paymentDate, notes } = payload;

    const { rows } = await db.query(
      `
        INSERT INTO payments (user_id, invoice_id, amount, payment_method, reference_number, payment_date, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
      [userId, invoiceId, amount, paymentMethod, referenceNumber, paymentDate, notes]
    );
    return camelcaseKeys(rows[0]);
  }
}

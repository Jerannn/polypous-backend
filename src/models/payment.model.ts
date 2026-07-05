import camelcaseKeys from "camelcase-keys";
import { PoolClient } from "pg";

import db from "../config/db.js";
import { Payment, PaymentInput, PaymentListItem, PaymentStats } from "../types/payment.types.js";

export default class PaymentModel {
  static async insert(
    client: PoolClient,
    userId: string,
    invoiceId: string,
    payload: PaymentInput
  ): Promise<Payment> {
    const { amount, paymentMethod, referenceNumber, paymentDate, notes } = payload;
    console.log("paymentDate: ", paymentDate);
    const { rows } = await client.query(
      `
        INSERT INTO payments (user_id, invoice_id, amount, payment_method, reference_number, payment_date, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
      [userId, invoiceId, amount, paymentMethod, referenceNumber, paymentDate, notes]
    );
    return camelcaseKeys(rows[0]);
  }

  static async findAllByUserId(
    userId: string,
    limit: number,
    offset: number,
    search: string = ""
  ): Promise<PaymentListItem[]> {
    const { rows } = await db.query(
      `
        SELECT
          p.*,
          inv.invoice_number,
          c.name as client_name,
          COUNT(*) OVER()::INT as total_count
        FROM payments p
        LEFT JOIN invoices inv ON inv.id = p.invoice_id
        LEFT JOIN clients c ON c.id = inv.client_id
        WHERE p.user_id = $1
              AND (
                $4::text = '' 
                OR c.name ILIKE '%' || $4 || '%' 
                OR inv.invoice_number ILIKE '%' || $4 || '%' 
                OR p.reference_number ILIKE '%' || $4 || '%'
              )
        ORDER BY created_at DESC
        LIMIT $2
        OFFSET $3
        `,
      [userId, limit, offset, search]
    );

    return camelcaseKeys(rows);
  }

  static async updateStatus(client: PoolClient, invoiceId: string) {
    await client.query(
      `
      UPDATE invoices
      SET status = 'PAID'
      WHERE id = $1 AND (
                      SELECT COALESCE(SUM(amount), 0)
                      FROM payments
                      WHERE invoice_id = $1
                    ) >= total
      RETURNING *
      `,
      [invoiceId]
    );
  }

  static async findPaymentsByUserId(userId: string): Promise<PaymentStats> {
    const { rows } = await db.query(
      `
      SELECT 
        COUNT(*) AS total_payments,
        COALESCE(SUM(amount), 0) AS total_revenue,
        COALESCE(AVG(amount), 0)::NUMERIC(12, 2) AS average_payment,
        COALESCE(SUM(amount) FILTER (
          WHERE payment_date >= date_trunc('month', CURRENT_DATE) AND payment_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' 
        ), 0) AS monthly_revenue
      FROM payments
      WHERE user_id = $1
      `,
      [userId]
    );

    return camelcaseKeys(rows[0]);
  }
}

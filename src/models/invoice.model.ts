import camelcaseKeys from "camelcase-keys";
import { PoolClient } from "pg";

import db from "../config/db.js";
import {
  Invoice,
  InvoiceInput,
  InvoiceItemInput,
  InvoiceListItem,
  InvoiceWithItemsAndClient,
} from "../types/invoice.types.js";

export default class InvoiceModel {
  static async insert(client: PoolClient, payload: InvoiceInput): Promise<Invoice> {
    const { userId, clientId, taxRate, issueDate, dueDate, notes, total, subtotal, invoiceNumber } =
      payload;

    const result = await client.query(
      `
        INSERT INTO invoices (user_id, client_id, invoice_number, tax, issue_date, due_date, notes, total, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `,
      [userId, clientId, invoiceNumber, taxRate, issueDate, dueDate, notes, total, subtotal]
    );

    return camelcaseKeys(result.rows[0]);
  }

  static async insertItems(client: PoolClient, invoiceId: string, payload: InvoiceItemInput[]) {
    const params = payload
      .map(
        (_, idx) =>
          `($${idx * 5 + 1}, $${idx * 5 + 2}, $${idx * 5 + 3}, $${idx * 5 + 4}, $${idx * 5 + 5})`
      )
      .join(", ");

    const values = payload
      .map((item) => [
        invoiceId,
        item.description,
        item.quantity,
        item.unitPrice,
        item.unitPrice * item.quantity,
      ])
      .flat();

    await client.query(
      `
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
        VALUES ${params}
        RETURNING *
        `,
      values
    );
  }

  static async findAllByUserId(
    userId: string,
    limit: number,
    offset: number,
    search: string = ""
  ): Promise<InvoiceListItem[]> {
    const { rows } = await db.query(
      `
      SELECT
        invoices.id,
        invoices.user_id,
        invoices.invoice_number,
        invoices.status,
        invoices.issue_date,
        invoices.due_date,
        invoices.total,
        invoices.subtotal,
        invoices.tax,
        invoices.notes,
        invoices.created_at,
        invoices.updated_at,
        c.name as client_name,
        COUNT(*) OVER()::INT as total_count
        
      FROM invoices
      LEFT JOIN clients c ON invoices.client_id = c.id
      WHERE invoices.user_id = $1 
            AND (
              $4::text = '' 
              OR invoices.invoice_number ILIKE '%'|| $4 || '%'
              OR c.name ILIKE '%'|| $4 || '%'
            )
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3
      `,
      [userId, limit, offset, search]
    );

    return camelcaseKeys(rows);
  }

  static async findByInvoiceId(invoiceId: string): Promise<InvoiceWithItemsAndClient> {
    const { rows } = await db.query(
      `
        SELECT 
          inv.id,
          inv.invoice_number,
          inv.status,
          inv.issue_date,
          inv.due_date,
          inv.subtotal,
          inv.tax,
          inv.total,
          inv.notes,
          COALESCE(fl, null) AS freelancer,
          COALESCE(client, null) AS client,
          COALESCE(items, '[]') AS items,
          COALESCE(payment_data, '[]') AS payments,
          inv.created_at,
          inv.updated_at

        FROM invoices inv

        LEFT JOIN LATERAL (
          SELECT 
            JSON_BUILD_OBJECT(
              'name', name,
              'email', email,
              'phone', phone,
              'address', address
            ) AS fl
          FROM businesses
          WHERE user_id = inv.user_id
        ) fl ON TRUE

        LEFT JOIN LATERAL (
          SELECT
            JSON_BUILD_OBJECT(
              'id', id,
              'name', name,
              'email', email,
              'phone', phone,
              'address', address
            ) AS client
          FROM clients
          WHERE id = inv.client_id
        ) client ON TRUE

        LEFT JOIN LATERAL (
          SELECT
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', id,
                'description', description,
                'quantity', quantity,
                'unit_price', unit_price,
                'total', total
              ) 
            ) FILTER (WHERE description IS NOT NULL) AS items
          FROM invoice_items
          WHERE invoice_id = inv.id
        ) items ON TRUE

        LEFT JOIN LATERAL (
          SELECT
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', p.id,
                'amount', p.amount,
                'payment_method', p.payment_method,
                'reference_number', p.reference_number,
                'payment_date', p.payment_date,
                'notes', p.notes
              ) ORDER BY p.created_at DESC
            ) FILTER (WHERE p.amount IS NOT NULL) AS payment_data
          FROM payments p
          WHERE p.invoice_id = inv.id
        ) payment_data ON TRUE

        WHERE inv.id = $1
      `,
      [invoiceId]
    );

    return camelcaseKeys(rows[0], { deep: true });
  }

  static async update(client: PoolClient, invoiceId: string, payload: InvoiceInput) {
    const { clientId, taxRate, issueDate, dueDate, notes, total, subtotal } = payload;

    await db.query(
      `
      UPDATE invoices
      SET client_id = $2, tax = $3, issue_date = $4, due_date = $5, subtotal = $6, total = $7, notes = $8
      WHERE id = $1
      RETURNING *
      `,
      [invoiceId, clientId, taxRate, issueDate, dueDate, subtotal, total, notes]
    );
  }

  static async replaceItems(client: PoolClient, invoiceId: string, payload: InvoiceItemInput[]) {
    await client.query("DELETE FROM invoice_items WHERE invoice_id = $1", [invoiceId]);

    // insert new items
    await this.insertItems(client, invoiceId, payload);
  }

  static async delete(id: string): Promise<boolean> {
    const { rowCount } = await db.query("DELETE FROM invoices WHERE id = $1", [id]);

    return rowCount !== null && rowCount > 0;
  }

  static async getInvoiceStats(userId: string) {
    const { rows } = await db.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE status = 'PAID') AS paid_count,
        COUNT(*) FILTER (WHERE status = 'UNPAID') AS unpaid_count,
        COUNT(*) FILTER (WHERE status = 'OVERDUE') AS overdue_count,
        (
          SELECT COALESCE(SUM(amount), 0)
          FROM payments
          WHERE user_id = $1
                AND payment_date >= date_trunc('month', CURRENT_DATE)
                AND payment_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        ) AS total_monthly_revenue,

        (
          SELECT
            COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'month', month,
                  'income', total
                )
              ),
              '[]'::json
            ) AS monthly_payments
          FROM
            (
              SELECT
                TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon YYYY') AS month,
                SUM(amount) AS total
              FROM payments
              WHERE user_id = $1
              GROUP BY DATE_TRUNC('month', payment_date)
              ORDER BY DATE_TRUNC('month', payment_date) DESC
              LIMIT 12
            ) 
        ) AS monthly_income,

        (
          SELECT
            COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'status', status,
                  'count', count
                )
              ),
              '[]'::json
            )
          FROM (
            SELECT status, COUNT(*) AS count
            FROM invoices
            WHERE user_id = $1
            GROUP BY status
          )
        ) AS invoice_status

      

      FROM invoices
      WHERE user_id = $1
      `,
      [userId]
    );

    return camelcaseKeys(rows[0]);
  }
}

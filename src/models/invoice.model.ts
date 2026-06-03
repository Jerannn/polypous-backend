import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { PoolClient } from "pg";
import { Invoice, InvoiceItemsPayload, InvoicePayload } from "../types/invoice.types.js";

export default class InvoiceModel {
  static async create(client: PoolClient, payload: InvoicePayload): Promise<Invoice> {
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

  static async createItems(client: PoolClient, invoiceId: string, payload: InvoiceItemsPayload) {
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

  static async findAllByUserId(userId: string, limit: number, offset: number, search: string = "") {
    const { rows } = await db.query(
      `
      SELECT
        id,
        user_id,
        invoice_number,
        status,
        issue_date,
        due_date,
        total,
        subtotal,
        tax,
        notes,
        created_at,
        updated_at,
        (
          SELECT name
          FROM clients
          WHERE id = client_id
        ) AS client_name,
        COUNT(*) OVER()::INT as total_count
        
      FROM invoices
      WHERE user_id = $1 
            AND ($4::text = '' OR invoice_number ILIKE '%'|| $4 || '%')
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3
      `,
      [userId, limit, offset, search]
    );

    return camelcaseKeys(rows);
  }
}

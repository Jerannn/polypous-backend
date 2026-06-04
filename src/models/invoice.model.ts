import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { PoolClient } from "pg";
import {
  Invoice,
  InvoiceInput,
  InvoiceItemInput,
  InvoiceListItem,
  InvoiceWithItemsAndClient,
} from "../types/invoice.types.js";

export default class InvoiceModel {
  static async create(client: PoolClient, payload: InvoiceInput): Promise<Invoice> {
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

  static async createItems(client: PoolClient, invoiceId: string, payload: InvoiceItemInput[]) {
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
          u.full_name,
          u.email,
          COALESCE(client, '{}') AS client,
          COALESCE(items, '[]') AS items,
          inv.created_at,
          inv.updated_at

        FROM invoices inv

        LEFT JOIN LATERAL (
          SELECT 
             full_name,
             email
          FROM users
          WHERE id = inv.user_id
        ) u ON TRUE

        LEFT JOIN LATERAL (
          SELECT
            JSON_BUILD_OBJECT(
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
                'description', description,
                'quantity', quantity,
                'unit_price', unit_price,
                'total', total
              ) 
            ) FILTER (WHERE description IS NOT NULL) AS items
          FROM invoice_items
          WHERE invoice_id = inv.id
        ) items ON TRUE

        WHERE inv.id = $1
      `,
      [invoiceId]
    );

    return camelcaseKeys(rows[0]);
  }
}

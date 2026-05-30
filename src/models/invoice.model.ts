import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { PoolClient } from "pg";
import { InvoiceItemsPayload, InvoicePayload } from "../types/invoice.types.js";
import { nanoid } from "nanoid";

export default class InvoiceModel {
  static async create(client: PoolClient, userId: string, payload: InvoicePayload) {
    const { clientId, taxRate, issueDate, dueDate, notes } = payload;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;
    const result = await client.query(
      `
        INSERT INTO invoices (user_id, client_id, invoice_number, tax, issue_date, due_date, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
      [userId, clientId, invoiceNumber, taxRate, issueDate, dueDate, notes]
    );

    return camelcaseKeys(result.rows[0]);
  }

  static async addItem(client: PoolClient, invoiceId: string, payload: InvoiceItemsPayload) {
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

    const result = await client.query(
      `
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
        VALUES ${params}
        RETURNING *
        `,
      values
    );
  }
}

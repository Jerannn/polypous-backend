import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { CreateClientPayload } from "../types/client.types.js";

export default class ClientModel {
  static async create(payload: CreateClientPayload, userId: string) {
    const { name, email, phone, address, notes } = payload;

    const { rows } = await db.query(
      `
        INSERT INTO clients (user_id, name, email, phone, address, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
      [userId, name, email, phone, address, notes]
    );

    return camelcaseKeys(rows[0]);
  }

  static async findAllByUserId(userId: string, limit: number, offset: number, search: string = "") {
    const { rows } = await db.query(
      `
        SELECT 
          c.*,
          COALESCE(inv.invoice_count, 0)::INT AS invoice_count,
          COALESCE(inv.total_paid, 0)::INT AS total_paid,
          COALESCE(inv.total_unpaid, 0)::INT AS total_unpaid,
          COUNT(*) OVER()::INT AS total_count

        FROM clients c
        LEFT JOIN (
          SELECT 
            client_id,
            COUNT(*) AS invoice_count,
            SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END) AS total_paid,
            SUM(CASE WHEN status = 'UNPAID' THEN total ELSE 0 END) AS total_unpaid
          FROM invoices
          GROUP BY client_id
        ) inv ON inv.client_id = c.id
        
        WHERE 
          c.user_id = $1
          AND ($4::text = '' OR c.name ILIKE '%' || $4 || '%')
        ORDER BY c.created_at DESC
        LIMIT $2
        OFFSET $3
        `,
      [userId, limit, offset, search]
    );

    return camelcaseKeys(rows);
  }
}

import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { Client, ClientPayload, ClientWithAnalytics, Options } from "../types/client.types.js";

export default class ClientModel {
  static async insert(payload: ClientPayload, userId: string): Promise<Client> {
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

  static async findAllByUserId(
    userId: string,
    limit: number,
    offset: number,
    search: string = ""
  ): Promise<ClientWithAnalytics[]> {
    const { rows } = await db.query(
      `
        SELECT 
          c.*,
          COALESCE(inv.invoice_count, 0)::INT AS invoice_count,
          COALESCE(inv.total_paid, 0)::INT AS total_paid,
          COALESCE(inv.total_unpaid, 0)::INT AS total_unpaid,
          COALESCE(inv.invoices_history, '[]'::JSON) AS invoices_history,
          COUNT(*) OVER()::INT AS total_count

        FROM clients c
        LEFT JOIN (
          SELECT 
            client_id,
            COUNT(*) AS invoice_count,
            SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END) AS total_paid,
            SUM(CASE WHEN status = 'UNPAID' THEN total ELSE 0 END) AS total_unpaid,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'invoice_number', invoice_number,
                'status', status,
                'due_date', due_date,
                'total', total
              )
            ) AS invoices_history
          FROM invoices
          GROUP BY client_id, created_at
          ORDER BY created_at DESC
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

    return camelcaseKeys(rows, { deep: true });
  }

  static async update(id: string, payload: ClientPayload): Promise<Client> {
    const { name, email, phone, address, notes } = payload;

    const { rows } = await db.query(
      `
        UPDATE clients
        SET name = $2, email = $3, phone = $4, address = $5, notes = $6
        WHERE id = $1
        RETURNING *
        `,
      [id, name, email, phone, address, notes]
    );

    return camelcaseKeys(rows[0]);
  }

  static async delete(id: string): Promise<boolean> {
    const { rowCount } = await db.query("DELETE FROM clients WHERE id = $1", [id]);

    return rowCount !== null && rowCount > 0;
  }

  static async findOptions(
    userId: string,
    cursor: { id: string; createdAt: string },
    limit: number,
    query: string = ""
  ): Promise<Options[]> {
    const createdAt = cursor?.createdAt ?? null;
    const id = cursor?.id ?? null;

    const { rows } = await db.query(
      `
      SELECT id, name, created_at
      FROM clients 
      WHERE user_id = $4
        AND ($5::text = '' OR name ILIKE '%' || $5::text || '%')
        AND (
          $1::timestamp IS NULL 
          OR (created_at, id) < ($1::timestamp, $2::uuid)
        )
      ORDER BY created_at DESC, id DESC
      LIMIT $3
      `,

      [createdAt, id, limit, userId, query]
    );

    return camelcaseKeys(rows);
  }
}

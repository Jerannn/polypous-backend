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

  static async findAllByUserId(userId: string, page: number, limit: number, search: string = "") {
    // LEFT JOIN invoices ON clients.id = invoices.client_id
    const { rows } = await db.query(
      `
        SELECT *
        FROM clients


        WHERE user_id = $1
        LIMIT $2
        OFFSET $3
        `,
      [userId, limit, page]
    );

    return camelcaseKeys(rows);
  }
}

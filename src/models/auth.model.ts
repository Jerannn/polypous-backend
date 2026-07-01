import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { Register, User } from "../types/auth.types.js";
import { hashSecret } from "../utils/helper.js";
import { ca } from "zod/locales";

export default class AuthModel {
  static async create(data: Register): Promise<User> {
    const { fullName, email, password } = data;
    const hashedPassword = await hashSecret(password);

    const { rows } = await db.query(
      `
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [fullName, email, hashedPassword]
    );

    return camelcaseKeys(rows[0]);
  }

  static async verifyUser(email: string): Promise<User> {
    const { rows } = await db.query(
      `
        UPDATE users
        SET email_verified = TRUE,
            email_verified_at = NOW(),
            updated_at = NOW()
        WHERE email = $1
        RETURNING *
    `,
      [email]
    );

    return camelcaseKeys(rows[0]);
  }

  static async findByEmail(email: string): Promise<User> {
    const { rows } = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
    `,
      [email]
    );

    return camelcaseKeys(rows[0]);
  }

  static async findById(id: string): Promise<User> {
    const { rows } = await db.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
    `,
      [id]
    );

    return camelcaseKeys(rows[0]);
  }

  static async deleteById(id: string): Promise<void> {
    await db.query(
      `
      DELETE FROM users
      WHERE id = $1
    `,
      [id]
    );
  }
}

import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { Business, BusinessInput, ProfileInput } from "../types/user.types.js";
import { UserWithoutSensitive } from "../types/auth.types.js";

export default class UserModel {
  static async updateById(userId: string, payload: ProfileInput): Promise<UserWithoutSensitive> {
    const { fullName, email, currency } = payload;

    const { rows } = await db.query(
      `
        UPDATE users 
        SET full_name = $1,
            email = $2, 
            currency = $3
        WHERE id = $4
        RETURNING id, full_name, email, currency, avatar_url, public_id, email_verified, email_verified_at, is_active, last_login_at, created_at, updated_at
        `,
      [fullName, email, currency, userId]
    );

    return camelcaseKeys(rows[0]);
  }

  static async updateBusiness(userId: string, payload: BusinessInput): Promise<Business> {
    const { name, email, address, phone } = payload;

    const { rows } = await db.query(
      `
      INSERT INTO businesses (name, email, address, phone, user_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET 
                name = $1, 
                email = $2, 
                address = $3, 
                phone = $4
      RETURNING *
      `,

      [name, email, address, phone, userId]
    );

    return camelcaseKeys(rows[0]);
  }

  static async getBusiness(userId: string): Promise<Business> {
    const { rows } = await db.query(
      `
      SELECT *
      FROM businesses
      WHERE user_id = $1
      `,
      [userId]
    );

    return rows[0];
  }
}

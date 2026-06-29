import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { ProfileInput } from "../types/user.types.js";
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
}

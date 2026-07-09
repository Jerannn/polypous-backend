import camelcaseKeys from "camelcase-keys";

import db from "../config/db.js";
import { RecentInvoice, Stats } from "../types/dashboard.types.js";

export default class DashboardModel {
  static async getStats(userId: string): Promise<Stats> {
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
            ) AS total_monthly_revenue

        FROM invoices
        WHERE user_id = $1
        `,
      [userId]
    );

    return camelcaseKeys(rows[0]);
  }

  static async getRecentInvoices(userId: string): Promise<RecentInvoice[]> {
    const { rows } = await db.query(
      `
        SELECT
          id,
          invoice_number,
          status,
          due_date,
          total,
          (
            SELECT name
            FROM clients
            WHERE id = client_id
          ) AS client_name
        FROM invoices
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 5
        `,
      [userId]
    );

    return camelcaseKeys(rows);
  }
}

import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { InvoiceStatus, MonthlyIncome, RecentInvoice, Stats } from "../types/dashboard.types.js";

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
  static async getMonthlyIncome(userId: string): Promise<MonthlyIncome[]> {
    const { rows } = await db.query(
      `
        SELECT
            COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'month', month,
                  'income', total
                )
              ),
              '[]'::json
            ) AS monthly_income
        FROM
            (
                SELECT
                    TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon YYYY') AS month,
                    SUM(amount) AS total
                FROM payments
                WHERE user_id = $1
                GROUP BY DATE_TRUNC('month', payment_date)
                ORDER BY DATE_TRUNC('month', payment_date) DESC
                LIMIT 12
            ) 
        `,
      [userId]
    );

    return camelcaseKeys(rows[0].monthly_income);
  }
  static async getInvoiceStatus(userId: string): Promise<InvoiceStatus[]> {
    const { rows } = await db.query(
      `
        WITH status_list AS (
            SELECT unnest(ARRAY['PAID', 'UNPAID', 'OVERDUE']) AS status
        ),
        counts AS (
            SELECT status::text, COUNT(*) as count
            FROM invoices
            WHERE user_id = $1
            GROUP BY status
        )
        SELECT
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'status', s.status,
                    'count', COALESCE(c.count, 0)
                ) ORDER BY s.status
            ) AS invoice_status
        FROM status_list s
        LEFT JOIN counts c ON c.status = s.status
        `,
      [userId]
    );

    return camelcaseKeys(rows[0].invoice_status);
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

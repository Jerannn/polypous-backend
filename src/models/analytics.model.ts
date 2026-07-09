import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";
import { InvoiceStatus, MonthlyIncome } from "../types/analytics.types.js";

export default class AnalyticsModel {
  static async getRevenue(userId: string) {
    const { rows } = await db.query(
      `
        WITH stats AS (
            SELECT
                COALESCE(SUM(amount), 0) AS total_revenue,

                COALESCE(
                    SUM(amount) FILTER (
                        WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE)
                        AND payment_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
                    ),
                    0
                ) AS this_month_revenue,

                COALESCE(
                    SUM(amount) FILTER (
                        WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                        AND payment_date < DATE_TRUNC('month', CURRENT_DATE)
                    ),
                    0
                ) AS last_month_revenue
            FROM payments 
            WHERE user_id = $1
        )
        SELECT
            total_revenue,
            COALESCE(ROUND(total_revenue / EXTRACT(MONTH FROM CURRENT_DATE), 2), 0) AS average_monthly_revenue,

            CASE
                WHEN last_month_revenue = 0 THEN 0
                ELSE ROUND (
                    (this_month_revenue - last_month_revenue) / last_month_revenue * 100,
                    0
                ) 
            END AS revenue_growth_percentage,

            COALESCE(c.total_clients, 0) AS total_clients,
            COALESCE(i.total_invoices, 0) AS total_invoices

        FROM stats
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS total_clients
          FROM clients
          WHERE user_id = $1
          GROUP BY user_id
        ) c ON c.user_id = $1
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS total_invoices
          FROM invoices
          WHERE user_id = $1
          GROUP BY user_id
        ) i ON i.user_id = $1
        `,
      [userId]
    );

    return camelcaseKeys(rows[0]);
  }

  static async getTopClients(userId: string) {
    const { rows } = await db.query(
      `
        SELECT
            c.name,
            COALESCE(SUM(p.amount), 0) AS revenue
        FROM clients c
        JOIN invoices i
            ON c.id = i.client_id
        JOIN payments p
            ON i.id = p.invoice_id
        WHERE c.user_id = $1
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
        LIMIT 10
        `,
      [userId]
    );

    return camelcaseKeys(rows);
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
        SELECT status, COALESCE(COUNT(*), 0) AS count
        FROM invoices
        WHERE user_id = $1
        GROUP BY status
        `,
      [userId]
    );

    return camelcaseKeys(rows);
  }
}

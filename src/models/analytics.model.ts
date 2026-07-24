import camelcaseKeys from "camelcase-keys";
import { differenceInDays, differenceInMonths } from "date-fns";

import db from "../config/db.js";
import {
  AnalyticsFilter,
  IncomeTrend,
  InvoiceStatus,
  Stats,
  TopClient,
} from "../types/analytics.types.js";

export default class AnalyticsModel {
  static async getStats(userId: string, query: AnalyticsFilter): Promise<Stats> {
    const from = query.from ? new Date(query.from).toLocaleDateString() : null;
    const to = query.to ? new Date(query.to).toLocaleDateString() : null;

    let groupBy: "day" | "month" | "year" = "month";

    if (from && to) {
      const days = differenceInDays(to, from);
      const months = differenceInMonths(to, from);

      switch (true) {
        case days <= 31:
          groupBy = "day";
          break;
        case months <= 12:
          groupBy = "month";
          break;
        default:
          groupBy = "year";
      }
    }

    const { rows } = await db.query(
      `
        WITH 
          params AS ( 
            SELECT 
              $1::uuid AS user_id, 
              $2::date AS from_date, 
              $3::date AS to_date,
              $4 AS group_by
          ),

          ranges AS (
            SELECT 
              user_id,
              group_by,
              from_date, 
              to_date

            FROM params
          ),

          -- Revenue (START)
          revenue_by_period AS (
            SELECT
              COALESCE(SUM(p.amount), 0) AS total_revenue,

              CASE
                WHEN r.group_by = 'day' THEN DATE_TRUNC('day', p.payment_date)
                WHEN r.group_by = 'month' THEN DATE_TRUNC('month', p.payment_date)
                ELSE DATE_TRUNC('year', p.payment_date)
              END AS period_date
              
            FROM payments p
            CROSS JOIN ranges r
            WHERE p.user_id = r.user_id
              AND (r.from_date::date IS NULL OR p.payment_date >= r.from_date::date)
              AND (r.to_date::date IS NULL OR p.payment_date < r.to_date::date + INTERVAL '1 day')
            GROUP BY period_date
            ORDER BY period_date
          ),

          ranked_revenue AS (
            SELECT
              total_revenue,
              ROW_NUMBER() OVER (ORDER BY period_date DESC) AS rn
            FROM revenue_by_period
          ),

          summary_revenue AS (
            SELECT
              MAX(total_revenue) FILTER (WHERE rn = 1) AS current,
              MAX(total_revenue) FILTER (WHERE rn = 2) AS previous
            FROM ranked_revenue
          ),
          -- Revenue (END)

          -- OUTSTANDING (START)
          outstanding_by_period AS (
            SELECT
              COALESCE(
                GREATEST(
                  SUM(i.total - COALESCE(p.amount_paid, 0)),
                  0
                ),
                0
              ) AS total_outstanding,

              CASE
                WHEN r.group_by = 'day' THEN DATE_TRUNC('day', i.issue_date)
                WHEN r.group_by = 'month' THEN DATE_TRUNC('month', i.issue_date)
                ELSE DATE_TRUNC('year', i.issue_date)
              END AS period_date

            FROM invoices i
            LEFT JOIN (
              SELECT
                invoice_id,
                SUM(amount) AS amount_paid
              FROM payments
              GROUP BY invoice_id
            ) p
            ON i.id = p.invoice_id
            CROSS JOIN ranges r
            WHERE i.user_id = r.user_id
              AND i.status = 'UNPAID'
              AND (r.from_date::date IS NULL OR issue_date >= r.from_date::date)
              AND (r.to_date::date IS NULL OR issue_date < r.to_date::date + INTERVAL '1 day')
            GROUP BY period_date
            ORDER BY period_date
          ),

          ranked_outstanding AS (
            SELECT
              total_outstanding,
              ROW_NUMBER() OVER (ORDER BY period_date DESC) AS rn
            FROM outstanding_by_period
          ),

          summary_outstanding AS (
            SELECT
              MAX(total_outstanding) FILTER (WHERE rn = 1) AS current,
              MAX(total_outstanding) FILTER (WHERE rn = 2) AS previous
            FROM ranked_outstanding
          ),
          -- OUTSTANDING (END)

          -- CLIENTS (START)
          clients_by_period AS (
            SELECT
              COUNT(c.*) AS total_clients,

              CASE
                WHEN r.group_by = 'day' THEN DATE_TRUNC('day', c.created_at)
                WHEN r.group_by = 'month' THEN DATE_TRUNC('month', c.created_at)
                ELSE DATE_TRUNC('year', c.created_at)
              END AS period_date

            FROM clients c
            CROSS JOIN ranges r
            WHERE c.user_id = r.user_id
              AND (r.from_date::date IS NULL OR created_at >= r.from_date::date)
              AND (r.to_date::date IS NULL OR created_at < r.to_date::date + INTERVAL '1 day')
            GROUP BY period_date
            ORDER BY period_date
          ),

          ranked_clients AS (
            SELECT
              total_clients,
              ROW_NUMBER() OVER (ORDER BY period_date DESC) AS rn
            FROM clients_by_period
          ),

          summary_clients AS (
            SELECT
              MAX(total_clients) FILTER (WHERE rn = 1) AS current,
              MAX(total_clients) FILTER (WHERE rn = 2) AS previous
            FROM ranked_clients
          ),
          -- CLIENTS (END)

          -- INVOICES (START)
          invoices_by_period AS (
            SELECT 
              COUNT (i.*) AS total_invoices,

              CASE
                WHEN r.group_by = 'day' THEN DATE_TRUNC('day', i.issue_date)
                WHEN r.group_by = 'month' THEN DATE_TRUNC('month', i.issue_date)
                ELSE DATE_TRUNC('year', i.issue_date)
              END AS period_date

            FROM invoices i
            CROSS JOIN ranges r
            WHERE i.user_id = r.user_id
              AND (r.from_date::date IS NULL OR issue_date >= r.from_date::date)
              AND (r.to_date::date IS NULL OR issue_date < r.to_date::date + INTERVAL '1 day')
            GROUP BY period_date
            ORDER BY period_date
          ),

          ranked_invoices AS (
            SELECT
              total_invoices,
              ROW_NUMBER() OVER (ORDER BY period_date DESC) AS rn
            FROM invoices_by_period
          ),

          summary_invoices AS (
            SELECT
              MAX(total_invoices) FILTER (WHERE rn = 1) AS current,
              MAX(total_invoices) FILTER (WHERE rn = 2) AS previous
            FROM ranked_invoices
          )
          -- INVOICES (END)
        
        SELECT 
          revenue,
          outstanding,
          clients,
          invoices

        FROM (
          SELECT
            JSON_BUILD_OBJECT(
              'total', (SELECT COALESCE(SUM(total_revenue), 0) FROM revenue_by_period),
              'current', current,
              'previous', previous,
              'growth', ROUND(((current - previous) / NULLIF(previous,0))*100, 2),
              'period', r.group_by
            ) AS revenue
          FROM summary_revenue
          CROSS JOIN ranges r
        ) revenue

        CROSS JOIN (
          SELECT
          JSON_BUILD_OBJECT(
            'total', (SELECT COALESCE(SUM(total_outstanding), 0) FROM outstanding_by_period),
            'current', current,
            'previous', previous,
            'growth', ROUND(((current - previous) / NULLIF(previous,0))*100, 2),
            'period', r.group_by
          ) AS outstanding
          FROM summary_outstanding
          CROSS JOIN ranges r
        ) AS outstanding

        CROSS JOIN (
          SELECT
          JSON_BUILD_OBJECT(
            'total', (SELECT COALESCE(SUM(total_clients), 0) FROM clients_by_period),
            'current', current,
            'previous', previous,
            'growth', current - NULLIF(previous,0),
            'period', r.group_by
          ) AS clients
          FROM summary_clients
          CROSS JOIN ranges r
        ) AS clients

        CROSS JOIN (
          SELECT
          JSON_BUILD_OBJECT(
            'total', (SELECT COALESCE(SUM(total_invoices), 0) FROM invoices_by_period),
            'current', current,
            'previous', previous,
            'growth', current - NULLIF(previous,0),
            'period', r.group_by
          ) AS invoices
          FROM summary_invoices
          CROSS JOIN ranges r
        ) AS invoices
        `,
      [userId, from, to, groupBy]
    );

    return camelcaseKeys(rows[0]);
  }

  static async getIncomeTrend(userId: string, query: AnalyticsFilter): Promise<IncomeTrend[]> {
    const from = query.from ? new Date(query.from).toLocaleDateString() : null;
    const to = query.to ? new Date(query.to).toLocaleDateString() : null;

    let groupBy: "day" | "month" | "year" = "month";

    if (from && to) {
      const days = differenceInDays(to, from);
      const months = differenceInMonths(to, from);

      switch (true) {
        case days <= 31:
          groupBy = "day";
          break;
        case months <= 12:
          groupBy = "month";
          break;
        default:
          groupBy = "year";
      }
    }

    const { rows } = await db.query(
      `
        WITH grouped AS (
            SELECT
                CASE
                    WHEN $4 = 'day' THEN DATE_TRUNC('day', payment_date)
                    WHEN $4 = 'month' THEN DATE_TRUNC('month', payment_date)
                    ELSE DATE_TRUNC('year', payment_date)
                END AS period_date,
                SUM(amount) AS total
            FROM payments
            WHERE user_id = $1
              AND ($2::date IS NULL OR payment_date >= $2)
              AND ($3::date IS NULL OR payment_date < $3::date + INTERVAL '1 day')
            GROUP BY period_date
        )

        SELECT
            CASE
                WHEN $4 = 'day' THEN TO_CHAR(period_date, 'DD Mon')
                WHEN $4 = 'month' THEN TO_CHAR(period_date, 'Mon YYYY')
                ELSE TO_CHAR(period_date, 'YYYY')
            END AS period,
            total
        FROM grouped
        ORDER BY period_date ASC
        `,
      [userId, from, to, groupBy]
    );

    return camelcaseKeys(rows);
  }

  static async getInvoiceStatus(userId: string, query: AnalyticsFilter): Promise<InvoiceStatus[]> {
    const from = query.from ? new Date(query.from).toLocaleDateString() : null;
    const to = query.to ? new Date(query.to).toLocaleDateString() : null;

    const { rows } = await db.query(
      `
        SELECT status, COALESCE(COUNT(*), 0) AS count
        FROM invoices
        WHERE user_id = $1
          AND ($2::date IS NULL OR issue_date >= $2)
          AND ($3::date IS NULL OR issue_date < $3::date + INTERVAL '1 day')
        GROUP BY status
        `,
      [userId, from, to]
    );

    return camelcaseKeys(rows);
  }

  static async getTopClients(userId: string, query: AnalyticsFilter): Promise<TopClient[]> {
    const from = query.from ? new Date(query.from).toLocaleDateString() : null;
    const to = query.to ? new Date(query.to).toLocaleDateString() : null;

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
            AND ($2::date IS NULL OR p.payment_date >= $2)
            AND ($3::date IS NULL OR p.payment_date < $3::date + INTERVAL '1 day')
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
        LIMIT 10
        `,
      [userId, from, to]
    );

    return camelcaseKeys(rows);
  }
}

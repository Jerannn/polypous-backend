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
    const { from, to } = query;

    const { rows } = await db.query(
      `
        WITH 
          revenue AS (
            SELECT
              COALESCE(SUM(amount), 0) AS total_revenue
            FROM payments
            WHERE user_id = $1
              AND ($2::date IS NULL OR payment_date >= $2::date)
              AND ($3::date IS NULL OR payment_date < $3::date + INTERVAL '1 day')
          ),

          outstanding AS (
            SELECT
              COALESCE(
                GREATEST(
                  SUM(i.total - COALESCE(p.amount_paid, 0)), 
                  0
                ), 
                0
              ) AS outstanding
            FROM invoices i
            LEFT JOIN (
              SELECT 
                invoice_id,
                SUM(amount) AS amount_paid
              FROM payments
              GROUP BY invoice_id
            ) p ON i.id = p.invoice_id
            WHERE i.user_id = $1
              AND i.status = 'UNPAID'
              AND ($2::date IS NULL OR issue_date >= $2::date)
              AND ($3::date IS NULL OR issue_date < $3::date + INTERVAL '1 day')
          ),

          clients AS (
            SELECT
              COUNT(*) AS total_clients
            FROM clients
            WHERE user_id = $1
              AND ($2::date IS NULL OR created_at >= $2::date)
              AND ($3::date IS NULL OR created_at < $3::date + INTERVAL '1 day')
          ),

          invoices AS (
            SELECT 
              COUNT (*) AS total_invoices
            FROM invoices
            WHERE user_id = $1
              AND ($2::date IS NULL OR issue_date >= $2::date)
              AND ($3::date IS NULL OR issue_date < $3::date + INTERVAL '1 day')
          )
        
        SELECT 
          JSON_BUILD_OBJECT(
            'current', revenue.total_revenue,
            'previous', '0',
            'growth', '0'
          ) AS revenue,

          JSON_BUILD_OBJECT(
            'current', outstanding.outstanding,
            'previous', '0',
            'growth', '0'
          ) AS outstanding,

          JSON_BUILD_OBJECT(
            'current', clients.total_clients,
            'previous', '0',
            'growth', '0'
          ) AS clients,       

          JSON_BUILD_OBJECT(
            'current', invoices.total_invoices,
            'previous', '0',
            'growth', '0'
          ) AS invoices

        FROM revenue
        CROSS JOIN outstanding
        CROSS JOIN clients
        CROSS JOIN invoices
        `,
      [userId, from, to]
    );

    return camelcaseKeys(rows[0]);
  }

  static async getIncomeTrend(userId: string, query: AnalyticsFilter): Promise<IncomeTrend[]> {
    const { from, to } = query;

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
    const { from, to } = query;

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
    const { from, to } = query;

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

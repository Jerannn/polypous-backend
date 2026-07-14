import AnalyticsModel from "../models/analytics.model.js";
import { AnalyticsFilter } from "../types/analytics.types.js";

export default class AnalyticsService {
  static async handleGetAnalytics(userId: string, query: AnalyticsFilter) {
    const [stats, incomeTrend, invoiceStatus, topClients] = await Promise.all([
      AnalyticsModel.getStats(userId, query),
      AnalyticsModel.getIncomeTrend(userId, query),
      AnalyticsModel.getInvoiceStatus(userId, query),
      AnalyticsModel.getTopClients(userId, query),
    ]);

    return {
      stats,
      incomeTrend,
      invoiceStatus,
      topClients,
    };
  }
}

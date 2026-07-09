import AnalyticsModel from "../models/analytics.model.js";

export default class AnalyticsService {
  static async handleGetAnalytics(userId: string) {
    const [stats, monthlyIncome, invoiceStatus, topClients] = await Promise.all([
      AnalyticsModel.getRevenue(userId),
      AnalyticsModel.getMonthlyIncome(userId),
      AnalyticsModel.getInvoiceStatus(userId),
      AnalyticsModel.getTopClients(userId),
    ]);
    return {
      stats,
      monthlyIncome,
      invoiceStatus,
      topClients,
    };
  }
}

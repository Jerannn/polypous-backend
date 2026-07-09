import AnalyticsModel from "../models/analytics.model.js";
import DashboardModel from "../models/dashboard.model.js";

export default class DashboardService {
  static async getOverview(userId: string) {
    const [stats, monthlyIncome, invoiceStatus, recentInvoices] = await Promise.all([
      DashboardModel.getStats(userId),
      AnalyticsModel.getMonthlyIncome(userId),
      AnalyticsModel.getInvoiceStatus(userId),
      DashboardModel.getRecentInvoices(userId),
    ]);

    return {
      stats,
      monthlyIncome,
      invoiceStatus,
      recentInvoices,
    };
  }
}

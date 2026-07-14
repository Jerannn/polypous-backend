import cron from "node-cron";

import InvoiceModel from "../../models/invoice.model.js";

export function startCronJobs() {
  console.log("Invoice cron job scheduled.");
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running overdue invoice job...");
    try {
      await InvoiceModel.markOverdueInvoices();
    } catch (error) {
      console.error(error);
    }
  });
}

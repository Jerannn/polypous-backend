export type Stats = {
  paidCount: string;
  unpaidCount: string;
  overdueCount: string;
  totalMonthlyRevenue: string;
};

export type RecentInvoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  dueDate: Date;
  total: number;
  clientName: string;
};

export type MonthlyIncome = {
  month: string;
  amount: number;
};

export type InvoiceStatus = {
  status: string;
  count: number;
};

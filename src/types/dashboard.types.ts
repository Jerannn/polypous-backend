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

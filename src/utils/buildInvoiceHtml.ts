import { InvoiceWithItemsAndClient } from "../types/invoice.types.js";

function formatDate(date: Date | string) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function getPaymentIcon(method: string) {
  const isCard = ["PAYPAL", "CARD", "STRIPE", "CREDIT_CARD"].includes(method.toUpperCase());
  if (isCard) {
    return `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    `;
  }
  return `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  `;
}

function getStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  let className = "cancelled";
  let label = "Cancelled";

  if (normalized === "PAID") {
    className = "paid";
    label = "Paid";
  } else if (normalized === "UNPAID" || normalized === "PENDING") {
    className = "unpaid";
    label = "Unpaid";
  } else if (normalized === "OVERDUE") {
    className = "overdue";
    label = "Overdue";
  }

  return `<span class="status-badge ${className}"><span class="status-dot"></span>${label}</span>`;
}

export function buildInvoiceHTML(invoice: InvoiceWithItemsAndClient) {
  const currency = "USD";

  const taxAmount = (Number(invoice.subtotal) * Number(invoice.tax)) / 100;

  const amountPaid = invoice.payments
    ? invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0)
    : 0;

  const balance = Math.max(0, Number(invoice.total) - amountPaid);

  const percentage =
    Number(invoice.total) > 0 ? Math.min(100, (amountPaid / Number(invoice.total)) * 100) : 0;
  const percentageStr = percentage.toFixed(2);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      
      @page {
        size: A4;
        margin: 15mm 15mm 15mm 15mm;
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 13px;
        color: #475569;
        background-color: #f8fafc;
        -webkit-print-color-adjust: exact;
        line-height: 1.5;
        padding: 20px;
      }
      
      .invoice-container {
        max-width: 100%;
        margin: 0 auto;
      }
      
      /* Layout */
      .invoice-grid {
        display: grid;
        grid-template-columns: 1.8fr 1fr;
        gap: 24px;
        align-items: start;
      }
      
      .invoice-main {
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 32px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      }
      
      .invoice-sidebar {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .sidebar-card {
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      }
      
      /* Logo and Header */
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
      }
      
      .logo-box {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .logo-icon {
        width: 36px;
        height: 36px;
        background-color: #f0fdf4;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .invoice-meta {
        text-align: right;
      }
      
      .meta-tag {
        font-size: 10px;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      
      .invoice-title {
        font-size: 22px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 8px;
      }
      
      .date-block {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 12px;
      }
      
      .date-row {
        margin-bottom: 2px;
      }
      
      .date-row span {
        color: #64748b;
      }
      
      .date-row strong {
        color: #334155;
      }
      
      .balance-box {
        text-align: right;
        margin-top: 12px;
      }
      
      .balance-label {
        font-size: 9px;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      
      .balance-value {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
      }
      
      /* Parties Info */
      .parties-section {
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: 20px;
        margin-bottom: 40px;
        padding-top: 24px;
        border-top: 1px dashed #e2e8f0;
      }
      
      .party-title {
        font-size: 10px;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      
      .party-name {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 4px;
      }
      
      .party-details {
        font-size: 12px;
        color: #64748b;
        line-height: 1.6;
      }
      
      /* Table styling */
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      
      .items-table th {
        font-size: 10px;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        padding: 10px 12px;
        border-bottom: 2px solid #f1f5f9;
        text-align: left;
      }
      
      .items-table th.right, .items-table td.right {
        text-align: right;
      }
      
      .items-table td {
        padding: 14px 12px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 13px;
        color: #475569;
      }
      
      .items-table td.desc {
        font-weight: 600;
        color: #1e293b;
      }
      
      .items-table td.amount {
        font-weight: 700;
        color: #0f172a;
      }
      
      /* Financial breakdown */
      .financial-totals {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        margin-bottom: 40px;
      }
      
      .totals-row {
        display: flex;
        justify-content: flex-end;
        width: 250px;
        font-size: 13px;
        color: #64748b;
      }
      
      .totals-row span {
        margin-right: auto;
      }
      
      .totals-row strong {
        color: #334155;
      }
      
      .grand-total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 320px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 14px 20px;
        margin-top: 8px;
      }
      
      .grand-total-label {
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
      }
      
      .grand-total-val {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
      }
      
      /* Notes */
      .notes-section {
        border-top: 1px solid #f1f5f9;
        padding-top: 24px;
      }
      
      .notes-label {
        font-size: 10px;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      
      .notes-content {
        font-size: 11px;
        color: #64748b;
        line-height: 1.6;
      }
      
      /* Sidebar Styles */
      .sidebar-title {
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .records-badge {
        font-size: 11px;
        font-weight: 600;
        background-color: #f1f5f9;
        color: #475569;
        padding: 2px 8px;
        border-radius: 9999px;
      }
      
      .paid-summary-block {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f1f5f9;
        margin-bottom: 16px;
      }
      
      .paid-summary-label {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .paid-summary-amount {
        font-size: 26px;
        font-weight: 800;
        color: #0f172a;
      }
      
      /* Badge styling */
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 10px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 9999px;
        align-self: flex-start;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      
      .status-badge.paid {
        background-color: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
      }
      .status-badge.unpaid {
        background-color: #fffbeb;
        color: #d97706;
        border: 1px solid #fde68a;
      }
      .status-badge.overdue {
        background-color: #fef2f2;
        color: #dc2626;
        border: 1px solid #fca5a5;
      }
      .status-badge.cancelled {
        background-color: #f9fafb;
        color: #4b5563;
        border: 1px solid #e5e7eb;
      }
      
      .status-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: currentColor;
      }
      
      /* Progress section */
      .progress-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .progress-label-row {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #64748b;
      }
      
      .progress-label-row strong {
        color: #334155;
      }
      
      .progress-bar {
        height: 6px;
        background-color: #f1f5f9;
        border-radius: 9999px;
        overflow: hidden;
      }
      
      .progress-bar-fill {
        height: 100%;
        background-color: #0d9488;
        border-radius: 9999px;
      }
      
      /* Payment history records list */
      .payment-records-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .payment-record-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: #f8fafc;
        border: 1px solid #f1f5f9;
        border-radius: 12px;
        padding: 12px;
      }
      
      .payment-icon-wrapper {
        width: 28px;
        height: 28px;
        background-color: #e2e8f0;
        color: #475569;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .payment-card-body {
        flex-grow: 1;
        min-width: 0;
      }
      
      .payment-card-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 2px;
      }
      
      .payment-card-amount {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
      }
      
      .payment-card-date {
        font-size: 11px;
        color: #64748b;
      }
      
      .payment-card-method {
        font-size: 10px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      
      .payment-card-ref {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 4px;
        font-family: monospace;
        word-break: break-all;
      }
      
      .empty-history {
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
        padding: 16px 0;
      }
      
      /* Print optimizations */
      @media print {
        body {
          background-color: #ffffff;
          padding: 0;
        }
        .invoice-main {
          box-shadow: none;
          border: 1px solid #e2e8f0;
        }
        .sidebar-card {
          box-shadow: none;
          border: 1px solid #e2e8f0;
        }
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <div class="invoice-grid">
        <!-- Main Content -->
        <div class="invoice-main">
          <!-- Header -->
          <div class="header-section">
            <div class="logo-box">
              <div class="logo-icon">
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 10V30" stroke="#0d9488" stroke-width="4" stroke-linecap="round"/>
                  <path d="M12 17C12 13.134 15.134 10 19 10C22.866 10 26 13.134 26 17C26 20.866 22.866 24 19 24H12" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div class="invoice-meta">
              <div class="meta-tag">Invoice</div>
              <div class="invoice-title">${invoice.invoiceNumber}</div>
              
              <div class="date-block">
                <div class="date-row"><span>Issued:</span> <strong>${formatDate(invoice.issueDate)}</strong></div>
                <div class="date-row"><span>Due:</span> <strong>${formatDate(invoice.dueDate)}</strong></div>
              </div>
              
              <div class="balance-box">
                <div class="balance-label">Balance Due</div>
                <div class="balance-value">${formatCurrency(balance, currency)}</div>
              </div>
            </div>
          </div>
          
          <!-- Parties -->
          <div class="parties-section">
            <div>
              <div class="party-title">From</div>
              <div class="party-name">Freelancer</div>
              <div class="party-details">
                <div>${invoice.freelancer.name}</div>
                <div>${invoice.freelancer.email}</div>
              </div>
            </div>
            
            <div>
              <div class="party-title">Bill To</div>
              <div class="party-name">${invoice.client.name}</div>
              <div class="party-details">
                <div>${invoice.client.email}</div>
                ${invoice.client.phone ? `<div>${invoice.client.phone}</div>` : ""}
                ${invoice.client.address ? `<div>${invoice.client.address}</div>` : ""}
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="right">Qty</th>
                <th class="right">Unit Price</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item: any) => `
                <tr>
                  <td class="desc">${item.description}</td>
                  <td class="right">${item.quantity}</td>
                  <td class="right">${formatCurrency(item.unitPrice, currency)}</td>
                  <td class="right amount">${formatCurrency(item.unitPrice * item.quantity, currency)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div class="financial-totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <strong>${formatCurrency(invoice.subtotal, currency)}</strong>
            </div>
            <div class="totals-row">
              <span>Tax (${invoice.tax}%)</span>
              <strong>${formatCurrency(taxAmount, currency)}</strong>
            </div>
            
            <div class="grand-total-row">
              <div class="grand-total-label">Total Amount</div>
              <div class="grand-total-val">${formatCurrency(invoice.total, currency)}</div>
            </div>
          </div>
          
          <!-- Notes -->
          ${
            invoice.notes
              ? `
            <div class="notes-section">
              <div class="notes-label">Notes & Terms</div>
              <div class="notes-content">${invoice.notes}</div>
            </div>
          `
              : ""
          }
        </div>
        
        <!-- Sidebar -->
        <div class="invoice-sidebar">
          <!-- Payment Summary -->
          <div class="sidebar-card">
            <div class="sidebar-title">Payment Summary</div>
            
            <div class="paid-summary-block">
              <div class="paid-summary-label">Total Paid</div>
              <div class="paid-summary-amount">${formatCurrency(amountPaid, currency)}</div>
              ${getStatusBadge(invoice.status)}
            </div>
            
            <div class="progress-section">
              <div class="progress-label-row">
                <strong>${formatCurrency(amountPaid, currency)} / ${formatCurrency(invoice.total, currency)}</strong>
                <span>${percentageStr}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${percentageStr}%;"></div>
              </div>
            </div>
          </div>
          
          <!-- Payment History -->
          <div class="sidebar-card">
            <div class="sidebar-title">
              <span>Payment History</span>
              <span class="records-badge">${invoice.payments ? invoice.payments.length : 0} records</span>
            </div>
            
            <div class="payment-records-list">
              ${
                invoice.payments && invoice.payments.length > 0
                  ? invoice.payments
                      .map(
                        (p: any) => `
                  <div class="payment-record-card">
                    <div class="payment-icon-wrapper">
                      ${getPaymentIcon(p.paymentMethod)}
                    </div>
                    <div class="payment-card-body">
                      <div class="payment-card-header">
                        <span class="payment-card-amount">${formatCurrency(p.amount, currency)}</span>
                        <span class="payment-card-date">${formatDate(p.paymentDate)}</span>
                      </div>
                      <div class="payment-card-method">${p.paymentMethod}</div>
                      ${p.referenceNumber ? `<div class="payment-card-ref">Ref: ${p.referenceNumber}</div>` : ""}
                    </div>
                  </div>
                `
                      )
                      .join("")
                  : `
                  <div class="empty-history">No payment records found.</div>
                `
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

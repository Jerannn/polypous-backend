import { InvoiceWithItemsAndClient } from "../types/invoice.types.js";

export function buildInvoiceHTML(invoice: InvoiceWithItemsAndClient) {
  return `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #111;
      }

      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
      }

      .title {
        font-size: 24px;
        font-weight: bold;
      }

      .section {
        margin-bottom: 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }

      th, td {
        border-bottom: 1px solid #ddd;
        padding: 10px;
        text-align: left;
      }

      .total {
        text-align: right;
        margin-top: 20px;
        font-size: 18px;
        font-weight: bold;
      }

      .badge {
        padding: 4px 10px;
        background: #eee;
        border-radius: 6px;
        font-size: 12px;
      }
    </style>
  </head>

  <body>
    <div class="header">
      <div>
        <div class="title">INVOICE</div>
        <div>#${invoice.id}</div>
      </div>

      <div>
        <div class="badge">${invoice.status}</div>
      </div>
    </div>

    <div class="section">
      <strong>Bill To:</strong><br/>
      ${invoice.client.name}<br/>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>

      <tbody>
        ${invoice.items
          .map(
            (item: any) => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="total">
      Total: $${invoice.total}
    </div>
  </body>
  </html>
  `;
}

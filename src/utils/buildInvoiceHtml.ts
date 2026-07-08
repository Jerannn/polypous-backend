import { InvoiceWithItemsAndClient } from "../types/invoice.types.js";

const CURRENCIES = [
  { code: "PHP", locale: "en-PH", symbol: "₱", name: "Philippine Peso" },
  { code: "USD", locale: "en-US", symbol: "$", name: "US Dollar" },
  { code: "EUR", locale: "de-DE", symbol: "€", name: "Euro" },
  { code: "GBP", locale: "en-GB", symbol: "£", name: "British Pound" },
  { code: "JPY", locale: "ja-JP", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", locale: "zh-CN", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", locale: "hi-IN", symbol: "₹", name: "Indian Rupee" },
  { code: "IDR", locale: "id-ID", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "BRL", locale: "pt-BR", symbol: "R$", name: "Brazilian Real" },
  { code: "RUB", locale: "ru-RU", symbol: "₽", name: "Russian Ruble" },
  { code: "KRW", locale: "ko-KR", symbol: "₩", name: "South Korean Won" },
  { code: "MXN", locale: "es-MX", symbol: "$", name: "Mexican Peso" },
  { code: "VND", locale: "vi-VN", symbol: "₫", name: "Vietnamese Dong" },
  { code: "TRY", locale: "tr-TR", symbol: "₺", name: "Turkish Lira" },
  { code: "CZK", locale: "cs-CZ", symbol: "Kč", name: "Czech Koruna" },
  { code: "SEK", locale: "sv-SE", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", locale: "nb-NO", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", locale: "da-DK", symbol: "kr", name: "Danish Krone" },
];

function formatDate(date: Date | string) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number, currencyCode: string) {
  const currencyConfig = CURRENCIES.find((currency) => currency.code === currencyCode);

  return Intl.NumberFormat(currencyConfig?.locale, {
    style: "currency",
    currency: currencyCode ?? "USD",
  }).format(amount ?? 0);
}

export function buildInvoiceHTML(invoice: InvoiceWithItemsAndClient) {
  const currency = invoice.currency;

  const taxAmount = (Number(invoice.subtotal) * Number(invoice.tax)) / 100;

  const amountPaid = invoice.payments
    ? invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0)
    : 0;

  const balance = Math.max(0, Number(invoice.total) - amountPaid);

  const percentage =
    Number(invoice.total) > 0 ? Math.min(100, (amountPaid / Number(invoice.total)) * 100) : 0;
  const percentageStr = percentage.toFixed(2);

  return `
  <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>Invoice ${invoice.invoiceNumber}</title>

        <!-- Favicon -->
        <link rel="icon" href="./images/favicon.png" type="image/x-icon" />

        <!-- Invoice styling -->
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

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
            font-family: "Inter", sans-serif;
            font-size: 13px;
            color: #1a3a31;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            line-height: 1.5;
          }
        </style>
      </head>

      <body>
        <main
          style="
            max-width: 800px;
            margin: 0 auto;
            /* border: 1px solid #000; */
            /* padding: 1rem; */
          "
        >
          <header>
            <div
              class="logo"
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e8e3dc;
                padding-bottom: 1rem;
              "
            >
              <img
                src="./src/assets/img/logo.svg"
                alt="Logo"
                style="width: 80px; height: 80px"
              />
              <h1 style="font-size: 24px">Invoice</h1>
            </div>

            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 0;
                border-bottom: 1px solid #e8e3dc;
              "
            >
              <span><b>Data:</b> ${formatDate(invoice.createdAt)}</span>
              <span><b>Invoice:</b> ${invoice.invoiceNumber}</span>
            </div>

            <div
              style="
                display: flex;
                justify-content: space-between;
                margin-top: 2rem;
              "
            >
              <!-- FREELANCER -->
              <div>
                <h2 style="font-size: 16px">FROM:</h2>
                <p>${invoice.freelancer.name}</p>
                <p>${invoice.freelancer.email}</p>
                <p>${invoice.freelancer.phone}</p>
                <p>${invoice.freelancer.address}</p>
              </div>

              <!-- CLIENT -->
              <div style="text-align: right">
                <h2 style="font-size: 15px">BILL TO:</h2>
                <p>${invoice.client.name}</p>
                <p>${invoice.client.email}</p>
                <p>${invoice.client.phone}8466266</p>
                <p>${invoice.client.address}</p>
              </div>
            </div>
          </header>

          <section style="margin-top: 2rem">
            <table
              style="
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
                border: 1px solid #e8e3dc;
              "
            >
              <thead style="background-color: #e8e3dc">
                <tr>
                  <th style="padding: 12px 15px; text-align: left">Description</th>
                  <th style="padding: 12px 15px; text-align: center">Qty</th>
                  <th style="padding: 12px 15px; text-align: right">Unit Price</th>
                  <th style="padding: 12px 15px; text-align: right">Amount</th>
                </tr>
              </thead>

              <tbody>
              ${invoice.items.map(
                (item) =>
                  `<tr>
                  <td style="padding: 12px 15px">${item.description}</td>
                  <td style="padding: 12px 15px; text-align: center">${item.quantity}</td>
                  <td style="padding: 12px 15px; text-align: right">${formatCurrency(item.unitPrice, currency)}</td>
                  <td style="padding: 12px 15px; text-align: right">${formatCurrency(item.total, currency)}</td>
                </tr>`
              )}

                <!-- Summary -->
                <tr style="border-top: 1px solid #e8e3dc">
                  <td
                    colspan="3"
                    style="padding: 12px 15px; text-align: right; font-weight: 600"
                  >
                    Subtotal:
                  </td>
                  <td style="padding: 12px 15px; text-align: right">${formatCurrency(invoice.subtotal, currency)}</td>
                </tr>

                <tr style="border-top: 1px solid #e8e3dc">
                  <td
                    colspan="3"
                    style="padding: 12px 15px; text-align: right; font-weight: 600"
                  >
                    Tax (10%):
                  </td>
                  <td style="padding: 12px 15px; text-align: right">${formatCurrency(taxAmount, currency)}</td>
                </tr>

                <tr style="background-color: #e8e3dc">
                  <td
                    colspan="3"
                    style="
                      padding: 14px 15px;
                      text-align: right;
                      font-weight: bold;
                      border-top: 2px solid #e8e3dc;
                    "
                  >
                    Total Amount:
                  </td>
                  <td
                    style="
                      padding: 14px 15px;
                      text-align: right;
                      font-weight: bold;
                      border-top: 2px solid #e8e3dc;
                    "
                  >
                    ${formatCurrency(invoice.total, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 style="font-size: 15px; margin-top: 2rem">Notes & Terms</h2>
            <p>
              ${invoice.notes}
            </p>
          </section>
        </main>
      </body>
    </html>

  `;
}

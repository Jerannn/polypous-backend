// import { PdfService } from "./pdf.service.js";
// import PDFService from "./pdf.service.js";
import { Decimal } from "decimal.js";
import { Request } from "express";
import { nanoid } from "nanoid";

import db from "../config/db.js";
import InvoiceModel from "../models/invoice.model.js";
import { InvoiceInput, InvoiceItemInput } from "../types/invoice.types.js";
import AppError from "../utils/appError.js";
import { buildInvoiceHTML } from "../utils/buildInvoiceHtml.js";
import generate from "./pdf.service.js";

export default class InvoiceService {
  static async handleCreateInvoice(req: Request) {
    const client = await db.pool.connect();

    const userId = req.user.id;
    const { items, ...invoice } = req.body;

    const totalAndSubtotal = (items as InvoiceItemInput[]).reduce(
      (acc, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        return { total: acc.total + itemTotal, subtotal: acc.subtotal + itemTotal };
      },
      { total: 0, subtotal: 0 }
    );

    const taxAmount = (totalAndSubtotal.subtotal * invoice.taxRate) / 100;

    const year = new Date().getUTCFullYear();
    const invoiceNumber = `INV-${year}-${nanoid(6).toUpperCase()}`;

    const invoicePayload: InvoiceInput = {
      ...invoice,
      total: totalAndSubtotal.total + taxAmount,
      subtotal: totalAndSubtotal.subtotal,
      userId,
      invoiceNumber,
    };

    try {
      await client.query("BEGIN");

      const newInvoice = await InvoiceModel.insert(client, invoicePayload);

      await InvoiceModel.insertItems(client, newInvoice.id, items as InvoiceItemInput[]);

      await client.query("COMMIT");

      return {
        ...newInvoice,
        total: Number(newInvoice.total),
        subtotal: Number(newInvoice.subtotal),
        tax: Number(newInvoice.tax),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async handleGetInvoices(req: Request) {
    const userId = req.user.id;
    const { page, limit, search } = req.validatedQuery;

    const parsedLimit = Number(limit);
    const parsedPage = Number(page);

    const offset = (parsedPage - 1) * parsedLimit;

    const invoices = await InvoiceModel.findAllByUserId(
      userId,
      parsedLimit,
      offset,
      search as string
    );

    const total = invoices[0]?.totalCount ?? 0;
    const totalPage = Math.ceil(total / parsedLimit);

    const invoiceData = invoices.map(({ totalCount, ...invoice }) => ({
      ...invoice,
      total: Number(invoice.total),
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
    }));

    return {
      meta: {
        limit,
        total,
        totalPage,
        currentPage: parsedPage,
        nextPage: parsedPage < totalPage ? parsedPage + 1 : null,
        prevPage: parsedPage > 1 ? parsedPage - 1 : null,
      },
      invoices: invoiceData,
    };
  }

  static async handleGetInvoice(req: Request) {
    const invoiceId = req.params.id as string;
    const invoice = await InvoiceModel.findByInvoiceId(invoiceId);

    if (!invoice) throw new AppError("Invoice not found", 404);

    const taxAmount = new Decimal(invoice.tax).mul(invoice.subtotal).div(100).toNumber();
    const total = new Decimal(invoice.total).toNumber();
    const subtotal = new Decimal(invoice.subtotal).toNumber();
    const tax = new Decimal(invoice.tax).toNumber();

    const amountPaid = invoice.payments
      .reduce((acc, payment) => acc.add(payment.amount), new Decimal(0))
      .toNumber();

    const balance = new Decimal(total).sub(amountPaid).toNumber();

    return {
      ...invoice,
      total,
      subtotal,
      tax,
      taxAmount,
      amountPaid,
      balance,
    };
  }

  static async handleDeleteInvoice(id: string): Promise<boolean> {
    return await InvoiceModel.delete(id);
  }

  static async handleUpdateInvoice(req: Request) {
    const client = await db.pool.connect();

    const invoiceId = req.params.id as string;
    const { items, ...invoice } = req.body;

    const totalAndSubtotal = (items as InvoiceItemInput[]).reduce(
      (acc, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        return { total: acc.total + itemTotal, subtotal: acc.subtotal + itemTotal };
      },
      { total: 0, subtotal: 0 }
    );

    const taxAmount = (totalAndSubtotal.subtotal * invoice.taxRate) / 100;

    const invoicePayload: InvoiceInput = {
      ...invoice,
      total: totalAndSubtotal.total + taxAmount,
      subtotal: totalAndSubtotal.subtotal,
    };

    try {
      await client.query("BEGIN");

      await InvoiceModel.update(client, invoiceId, invoicePayload);
      await InvoiceModel.replaceItems(client, invoiceId, items as InvoiceItemInput[]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async handleDownloadInvoicePDF(id: string) {
    const invoice = await InvoiceModel.findByInvoiceId(id);

    if (!invoice) throw new AppError("Invoice not found", 404);

    const html = buildInvoiceHTML(invoice);

    const pdf = await generate(html);

    return { pdf, filename: `invoice-${invoice.invoiceNumber}.pdf` };
  }

  static async handleMarkOverdueInvoices() {
    await InvoiceModel.markOverdueInvoices();
  }
}

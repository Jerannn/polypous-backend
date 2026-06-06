import { NextFunction, Request } from "express";
import db from "../config/db.js";
import InvoiceModel from "../models/invoice.model.js";
import { InvoiceItemInput, InvoiceInput } from "../types/invoice.types.js";
import { nanoid } from "nanoid";
import AppError from "../utils/appError.js";

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

      const newInvoice = await InvoiceModel.create(client, invoicePayload);

      await InvoiceModel.createItems(client, newInvoice.id, items as InvoiceItemInput[]);

      await client.query("COMMIT");

      return newInvoice;
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

    return invoice;
  }

  static async handleDeleteInvoice(id: string) {
    await InvoiceModel.delete(id);
  }
}

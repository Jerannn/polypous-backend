import { Request } from "express";
import db from "../config/db.js";
import InvoiceModel from "../models/invoice.model.js";
import { InvoiceItemsPayload, InvoicePayload } from "../types/invoice.types.js";
import { nanoid } from "nanoid";

export default class InvoiceService {
  static async handleCreateInvoice(req: Request) {
    const client = await db.pool.connect();

    const userId = req.user.id;
    const { items, ...invoice } = req.body;

    const totalAndSubtotal = (items as InvoiceItemsPayload).reduce(
      (acc, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        return { total: acc.total + itemTotal, subtotal: acc.subtotal + itemTotal };
      },
      { total: 0, subtotal: 0 }
    );

    const taxAmount = (totalAndSubtotal.subtotal * invoice.taxRate) / 100;

    const year = new Date().getUTCFullYear();
    const invoiceNumber = `INV-${year}-${nanoid(6).toUpperCase()}`;

    const invoicePayload: InvoicePayload = {
      ...invoice,
      total: totalAndSubtotal.total + taxAmount,
      subtotal: totalAndSubtotal.subtotal,
      userId,
      invoiceNumber,
    };

    try {
      await client.query("BEGIN");

      const newInvoice = await InvoiceModel.create(client, invoicePayload);

      await InvoiceModel.createItems(client, newInvoice.id, items as InvoiceItemsPayload);

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
}

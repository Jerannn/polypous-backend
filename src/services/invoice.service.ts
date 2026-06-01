import { Request } from "express";
import db from "../config/db.js";
import InvoiceModel from "../models/invoice.model.js";
import { InvoiceItemsPayload, InvoicePayload } from "../types/invoice.types.js";

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

    const invoicePayload: InvoicePayload = {
      ...invoice,
      total: totalAndSubtotal.total + taxAmount,
      subtotal: totalAndSubtotal.subtotal,
      userId,
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
}

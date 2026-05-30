import { Request } from "express";
import db from "../config/db.js";
import InvoiceModel from "../models/invoice.model.js";
import { InvoiceItemsPayload, InvoicePayload } from "../types/invoice.types.js";

export default class InvoiceService {
  static async handleCreateInvoice(req: Request) {
    const userId = req.user.id;
    const { items, ...invoice } = req.body;

    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const newInvoice = await InvoiceModel.create(client, userId, invoice as InvoicePayload);

      await InvoiceModel.addItem(client, newInvoice.id, items as InvoiceItemsPayload);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

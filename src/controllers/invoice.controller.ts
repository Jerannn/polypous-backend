import { NextFunction, Response, Request } from "express";
import catchAsync from "../utils/catchAsync.js";
import InvoiceService from "../services/invoice.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const createInvoice = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const newInvoice = await InvoiceService.handleCreateInvoice(req);

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      data: { invoice: newInvoice },
    });
  }
);

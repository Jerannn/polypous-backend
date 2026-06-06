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

export const getInvoices = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { invoices, meta } = await InvoiceService.handleGetInvoices(req);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { meta, invoices },
  });
});

export const getInvoice = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const invoice = await InvoiceService.handleGetInvoice(req);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { invoice },
  });
});

export const deleteInvoice = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await InvoiceService.handleDeleteInvoice(req.params.id as string);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
    });
  }
);

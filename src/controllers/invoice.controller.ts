import { NextFunction, Request, Response } from "express";

import InvoiceService from "../services/invoice.service.js";
import catchAsync from "../utils/catchAsync.js";
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

export const updateInvoice = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const updatedInvoice = await InvoiceService.handleUpdateInvoice(req);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: { invoice: updatedInvoice },
    });
  }
);

export const deleteInvoice = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const isDeleted = await InvoiceService.handleDeleteInvoice(req.params.id as string);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: { isDeleted },
    });
  }
);

export const downloadInvoicePDF = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { pdf, filename } = await InvoiceService.handleDownloadInvoicePDF(
      req.params.id as string
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    res.send(pdf);
  }
);

export const markOverdueInvoices = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await InvoiceService.handleMarkOverdueInvoices();

    res.status(HTTP_STATUS.OK).json({
      status: "success",
    });
  }
);

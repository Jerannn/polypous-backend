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
    const pdf = await InvoiceService.handleDownloadInvoicePDF(req.params.id as string);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${req.params.id}.pdf`);
    res.send(pdf);
  }
);

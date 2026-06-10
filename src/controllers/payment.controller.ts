import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import PaymentService from "../services/payment.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const createPayment = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const newPayment = await PaymentService.handleCreatePayment(req);

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      data: { payment: newPayment },
    });
  }
);

export const getAllPayments = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { payments, meta } = await PaymentService.handleGetAllPayments(req);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: { meta, payments },
    });
  }
);

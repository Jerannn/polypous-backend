import { NextFunction, Response, Request } from "express";
import catchAsync from "../utils/catchAsync.js";
import { HTTP_STATUS } from "../utils/constants.js";
import UserService from "../services/user.service.js";

export const getMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  // Remove sensitive information before sending the response
  req.user.passwordHash = undefined;
  req.user.passwordResetToken = undefined;
  req.user.passwordResetExpiresAt = undefined;

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { user: req.user },
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const updatedUser = await UserService.handleUpdateUser(req);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { user: updatedUser },
  });
});

export const updateMyBusiness = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const updatedBusiness = await UserService.handleUpdateBusiness(req);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: { business: updatedBusiness },
    });
  }
);

export const getMyBusiness = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const business = await UserService.handleGetBusiness(req.user.id);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: { business },
    });
  }
);

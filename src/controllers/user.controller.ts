import { NextFunction, Request, Response } from "express";

import UserService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import { HTTP_STATUS } from "../utils/constants.js";
import { cookieOptions } from "./auth.controller.js";

export const getMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  // Remove sensitive information before sending the response
  req.user.passwordHash = undefined;
  req.user.passwordResetToken = undefined;
  req.user.passwordResetExpiresAt = undefined;
  req.user.refreshToken = undefined;

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
      data: { business: business || [] },
    });
  }
);

export const verifyPassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const verified = await UserService.handleVerifyPassword(req.user.id, req.body.password);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: { verified },
    });
  }
);

export const deleteMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  await UserService.handleDeleteUser(req.user.id);

  res.cookie("jwt", "", { ...cookieOptions(), maxAge: 1 });

  res.status(HTTP_STATUS.OK).json({
    status: "success",
  });
});

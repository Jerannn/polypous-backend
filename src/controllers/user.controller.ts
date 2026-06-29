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
  const updatedUser = await UserService.updateUser(req);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { user: updatedUser },
  });
});

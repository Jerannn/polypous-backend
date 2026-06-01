import { NextFunction, Response, Request } from "express";
import catchAsync from "../utils/catchAsync.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const getMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  // Remove sensitive information before sending the response
  req.user.passwordHash = undefined;
  req.user.passwordResetToken = undefined;
  req.user.passwordResetExpiresAt = undefined;
  // console.log("User info sent to client:", req.user);
  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { user: req.user },
  });
});

import { CookieOptions, NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import env from "../config/env.js";
import { User } from "../types/auth.types.js";
import { generateToken } from "../utils/generateToken.js";
import AuthService from "../services/auth.service.js";
import { HTTP_STATUS } from "../utils/constants.js";
import { OTPService } from "../services/otp.service.js";
import AuthModel from "../models/auth.model.js";
import { getOtpSchema } from "../schemas/otp.schema.js";

export const cookieOptions = (): CookieOptions => {
  const isProduction = env.STAGE === "production";

  return {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
};

const sendAuthResponse = (user: User, statusCode: number, res: Response) => {
  const token = generateToken(user.id);

  res.cookie("jwt", token, { ...cookieOptions });

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

export const register = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const user = await AuthService.createAccount(req.body);

  res.status(HTTP_STATUS.CREATED).json({
    status: "success",
    data: { user },
  });
});

export const login = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, password } = req.body;

  const user = await AuthService.authenticateUser(email, password);

  sendAuthResponse(user, HTTP_STATUS.OK, res);
});

export const verifyRegistration = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp } = req.body;

    const success = await OTPService.verifyOtp(email, otp, "register");
    const verifiedUser = await AuthModel.verifyUser(success.email);

    verifiedUser.passwordHash = undefined;

    sendAuthResponse(verifiedUser, HTTP_STATUS.OK, res);
  }
);

export const resendVerification = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, action } = req.body;

    const otp = await OTPService.resendOtp(email, action);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      message: "OTP resend successfully",
      data: { otp },
    });
  }
);

export const getOtp = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, action } = getOtpSchema.parse(req.query);

  const otp = await OTPService.getOtp(email, action);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { otp },
  });
});

export const logout = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  res.cookie("jwt", "", { ...cookieOptions, maxAge: 1 });

  res.status(HTTP_STATUS.OK).json({
    status: "success",
  });
});

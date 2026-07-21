import { CookieOptions, NextFunction, Request, Response } from "express";

import env from "../config/env.js";
import AuthModel from "../models/auth.model.js";
import { getOtpSchema } from "../schemas/otp.schema.js";
import AuthService from "../services/auth.service.js";
import { OTPService } from "../services/otp.service.js";
import { User } from "../types/auth.types.js";
import catchAsync from "../utils/catchAsync.js";
import { HTTP_STATUS } from "../utils/constants.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { hashSecret } from "../utils/helper.js";

export const cookieOptions = (): CookieOptions => {
  const isProduction = env.STAGE === "production";

  return {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

export const sendAuthResponse = async (user: User, statusCode: number, res: Response) => {
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const hashedRefreshToken = await hashSecret(refreshToken);
  await AuthModel.saveRefreshTokenHash(user.id, hashedRefreshToken);

  // remove sensitive data
  user.passwordHash = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  user.refreshToken = undefined;

  res.cookie("refreshToken", refreshToken, cookieOptions());

  res.status(statusCode).json({
    status: "success",
    token: accessToken,
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

export const refreshToken = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const user = await AuthService.handleRefreshToken(req.cookies.refreshToken);

  sendAuthResponse(user, HTTP_STATUS.OK, res);
});

export const logout = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  await AuthService.handleLogout(req.cookies.refreshToken);

  res.clearCookie("refreshToken", cookieOptions());

  res.status(HTTP_STATUS.OK).json({
    status: "success",
  });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    await AuthService.handleForgotPassword(res, email);
  }
);

export const verifyForgotPassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp } = req.body;

    const token = await AuthService.handleVerifyForgotPassword(email, otp);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: { token },
    });
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { newPassword, token } = req.body;

    await AuthService.handleResetPassword(newPassword, token);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
    });
  }
);

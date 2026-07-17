import express from "express";

import {
  forgotPassword,
  getOtp,
  login,
  logout,
  refreshToken,
  register,
  resendVerification,
  resetPassword,
  verifyForgotPassword,
  verifyRegistration,
} from "../controllers/auth.controller.js";
import {
  loginLimiter,
  otpLimiter,
  publicAuthLimiter,
} from "../middlewares/rate-limiter.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema.js";
import { resendOtpSchema, verifySchema } from "../schemas/otp.schema.js";

const router = express.Router();

router.post("/register", publicAuthLimiter, validateRequest({ body: registerSchema }), register);
router.post("/login", loginLimiter, validateRequest({ body: loginSchema }), login);
router.post("/logout", publicAuthLimiter, logout);
router.post("/refresh", publicAuthLimiter, refreshToken);

// EMAIL VERIFICATION
router.get("/email/otp", otpLimiter, getOtp);
router.post(
  "/email/verify",
  otpLimiter,
  validateRequest({ body: verifySchema }),
  verifyRegistration
);
router.post(
  "/email/resend",
  publicAuthLimiter,
  validateRequest({ body: resendOtpSchema }),
  resendVerification
);

// FORGOT PASSWORD
router.post(
  "/password/forgot",
  otpLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  forgotPassword
);
router.post(
  "/password/verify",
  otpLimiter,
  validateRequest({ body: verifySchema }),
  verifyForgotPassword
);
router.post(
  "/password/reset",
  publicAuthLimiter,
  validateRequest({ body: resetPasswordSchema }),
  resetPassword
);

export default router;

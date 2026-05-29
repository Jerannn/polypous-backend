import express from "express";
import {
  getOtp,
  login,
  register,
  resendVerification,
  verifyRegistration,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { resendOtpSchema, verifySchema } from "../schemas/otp.schema.js";
import {
  loginLimiter,
  otpLimiter,
  publicAuthLimiter,
} from "../middlewares/rate-limiter.middleware.js";

const router = express.Router();

router.post("/register", publicAuthLimiter, validateRequest({ body: registerSchema }), register);
router.post("/login", loginLimiter, validateRequest({ body: loginSchema }), login);

//  EMAIL VERIFICATION
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

export default router;

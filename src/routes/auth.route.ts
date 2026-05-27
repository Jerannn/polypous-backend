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

const router = express.Router();

router.post("/register", validateRequest({ body: registerSchema }), register);
router.post("/login", validateRequest({ body: loginSchema }), login);

//  EMAIL VERIFICATION
router.get("/email/otp", getOtp);
router.post("/email/verify", validateRequest({ body: verifySchema }), verifyRegistration);
router.post("/email/resend", validateRequest({ body: resendOtpSchema }), resendVerification);

export default router;

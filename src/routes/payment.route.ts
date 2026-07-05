import express from "express";

import {
  createPayment,
  getAllPayments,
  getPaymentStats,
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import {
  paymentIdParamsSchema,
  paymentQuerySchema,
  recordPaymentSchema,
} from "../schemas/payment.schema.js";

const router = express.Router();

router.get(
  "/",
  protect,
  apiLimiter,
  validateRequest({ query: paymentQuerySchema }),
  getAllPayments
);

router.get("/stats", protect, apiLimiter, getPaymentStats);

router.post(
  "/:id",
  protect,
  apiLimiter,
  validateRequest({ body: recordPaymentSchema, params: paymentIdParamsSchema }),
  createPayment
);

export default router;

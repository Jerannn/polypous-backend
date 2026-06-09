import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { paymentIdParamsSchema, recordPaymentSchema } from "../schemas/payment.schema.js";
import { createPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post(
  "/:id",
  protect,
  apiLimiter,
  validateRequest({ body: recordPaymentSchema, params: paymentIdParamsSchema }),
  createPayment
);

export default router;

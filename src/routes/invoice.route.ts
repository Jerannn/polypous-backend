import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import {
  invoiceIdParamsSchema,
  invoiceQuerySchema,
  invoiceSchema,
} from "../schemas/invoice.schema.js";
import { createInvoice, getInvoice, getInvoices } from "../controllers/invoice.controller.js";

const router = express.Router();

router.post("/", protect, apiLimiter, validateRequest({ body: invoiceSchema }), createInvoice);
router.get("/", protect, apiLimiter, validateRequest({ query: invoiceQuerySchema }), getInvoices);
router.get(
  "/:id",
  protect,
  apiLimiter,
  validateRequest({ params: invoiceIdParamsSchema }),
  getInvoice
);

export default router;

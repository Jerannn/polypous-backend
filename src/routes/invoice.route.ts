import express from "express";

import {
  createInvoice,
  deleteInvoice,
  downloadInvoicePDF,
  getInvoice,
  getInvoices,
  updateInvoice,
} from "../controllers/invoice.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import {
  invoiceIdParamsSchema,
  invoiceQuerySchema,
  invoiceSchema,
} from "../schemas/invoice.schema.js";

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

router.patch(
  "/:id",
  protect,
  apiLimiter,
  validateRequest({ body: invoiceSchema, params: invoiceIdParamsSchema }),
  updateInvoice
);

router.delete(
  "/:id",
  protect,
  apiLimiter,
  validateRequest({ params: invoiceIdParamsSchema }),
  deleteInvoice
);

router.get("/:id/pdf", protect, apiLimiter, downloadInvoicePDF);

export default router;

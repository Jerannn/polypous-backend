import express from "express";

import {
  createClient,
  deleteClient,
  getClients,
  getOptions,
  updateClient,
} from "../controllers/client.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import {
  clientParamsSchema,
  clientSchema,
  queryOptionsSchema,
  querySchema,
} from "../schemas/client.schema.js";
const router = express.Router();

router.post("/", protect, apiLimiter, validateRequest({ body: clientSchema }), createClient);
router.get("/", protect, apiLimiter, validateRequest({ query: querySchema }), getClients);
router.delete(
  "/:id",
  protect,
  apiLimiter,
  validateRequest({ params: clientParamsSchema }),
  deleteClient
);
router.patch(
  "/:id",
  protect,
  apiLimiter,
  validateRequest({ body: clientSchema, params: clientParamsSchema }),
  updateClient
);

router.get(
  "/options",
  protect,
  apiLimiter,
  validateRequest({ query: queryOptionsSchema }),
  getOptions
);

export default router;

import express from "express";
import {
  createClient,
  deleteClient,
  getClients,
  getOptions,
  updateClient,
} from "../controllers/client.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { clientSchema, clientParamsSchema, querySchema } from "../schemas/client.schema.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
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

router.get("/options", protect, apiLimiter, getOptions);

export default router;

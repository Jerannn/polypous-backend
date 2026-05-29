import express from "express";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "../controllers/client.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { clientSchema, clientParamsSchema, querySchema } from "../schemas/client.schema.js";
import { globalLimiter } from "../middlewares/rate-limiter.middleware.js";
const router = express.Router();

router.post("/", globalLimiter, protect, validateRequest({ body: clientSchema }), createClient);
router.get("/", globalLimiter, protect, validateRequest({ query: querySchema }), getClients);
router.delete(
  "/:id",
  globalLimiter,
  protect,
  validateRequest({ params: clientParamsSchema }),
  deleteClient
);
router.patch(
  "/:id",
  globalLimiter,
  protect,
  validateRequest({ body: clientSchema, params: clientParamsSchema }),
  updateClient
);

export default router;

import express from "express";

import { getAnalytics } from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { filterSchema } from "../schemas/analytics.schema.js";

const router = express.Router();

router.get("/", protect, apiLimiter, validateRequest({ query: filterSchema }), getAnalytics);

export default router;

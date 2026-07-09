import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";

const router = express.Router();

router.get("/", protect, apiLimiter, getAnalytics);

export default router;

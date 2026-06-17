import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { getOverview } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/overview", protect, apiLimiter, getOverview);

export default router;

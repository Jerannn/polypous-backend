import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { getMe } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", protect, apiLimiter, getMe);

export default router;

import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { getMe, updateMe } from "../controllers/user.controller.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { profileSchema } from "../schemas/user.schema.js";

const router = express.Router();

router.get("/me", protect, apiLimiter, getMe);

router.patch("/me", protect, apiLimiter, validateRequest({ body: profileSchema }), updateMe);

export default router;

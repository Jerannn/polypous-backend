import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import {
  getMe,
  getMyBusiness,
  updateMe,
  updateMyBusiness,
  verifyPassword,
} from "../controllers/user.controller.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { businessSchema, profileSchema, verifyPasswordSchema } from "../schemas/user.schema.js";

const router = express.Router();

router.get("/me", protect, apiLimiter, getMe);
router.patch("/me", protect, apiLimiter, validateRequest({ body: profileSchema }), updateMe);
router.get("/me/business", protect, apiLimiter, getMyBusiness);
router.put(
  "/me/business",
  protect,
  apiLimiter,
  validateRequest({ body: businessSchema }),
  updateMyBusiness
);

router.post(
  "/me/verify-password",
  protect,
  apiLimiter,
  validateRequest({ body: verifyPasswordSchema }),
  verifyPassword
);

export default router;

import express from "express";

import {
  deleteBusinessLogo,
  deleteMe,
  getMe,
  getMyBusiness,
  updateMe,
  updateMyBusiness,
  uploadBusinessLogo,
  verifyPassword,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { uploadLogo } from "../middlewares/upload.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { businessSchema, profileSchema, verifyPasswordSchema } from "../schemas/user.schema.js";

const router = express.Router();

router.get("/me", protect, apiLimiter, getMe);
router.patch("/me", protect, apiLimiter, validateRequest({ body: profileSchema }), updateMe);
router.delete("/me", protect, apiLimiter, deleteMe);

router.get("/me/business", protect, apiLimiter, getMyBusiness);
router.put(
  "/me/business",
  protect,
  apiLimiter,
  validateRequest({ body: businessSchema }),
  updateMyBusiness
);
router.put("/me/business/logo", protect, apiLimiter, uploadLogo, uploadBusinessLogo);
router.delete("/me/business/logo", protect, apiLimiter, deleteBusinessLogo);

router.post(
  "/me/verify-password",
  protect,
  apiLimiter,
  validateRequest({ body: verifyPasswordSchema }),
  verifyPassword
);

export default router;

import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import AppError from "../utils/appError.js";
import { Request } from "express";

type Limiter = {
  windowMs: number;
  max: number;
  keyType?: "ip" | "email" | "user";
};

export const createLimiter = ({
  windowMs,
  max,
  keyType = "ip",
}: Limiter): ReturnType<typeof rateLimit> => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req: Request): string => {
      if (req.user?.id) return `user:${req.user.id}`;
      return `ip:${ipKeyGenerator(req.ip as string)}`;
    },

    handler: (_req, _res, next) => {
      return next(new AppError("Too many requests. Please try again later.", 429));
    },
  });
};

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// login (very strict)
export const loginLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyType: "email",
});

// OTP (moderate)
export const otpLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyType: "email",
});

// public auth (light)
export const publicAuthLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyType: "email",
});

// sensitive (authenticated users)
export const sensitiveLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyType: "user",
});

import { type Duration, Ratelimit } from "@upstash/ratelimit";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ipKeyGenerator } from "express-rate-limit";

import redis from "../lib/redis/redis.client.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { HTTP_STATUS, MESSAGES } from "../utils/constants.js";

type KeyType = "ip" | "email" | "user" | "emailIp";

type LimiterOptions = {
  name: string;
  windowMs: number;
  max: number;
  keyType?: KeyType;
};

const normalizeEmail = (value: unknown): string | undefined => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value.toLowerCase().trim();
};

const getEmailFromRequest = (req: Request): string | undefined => {
  return normalizeEmail(req.body?.email) ?? normalizeEmail(req.query?.email);
};

const windowToDuration = (windowMs: number): Duration => {
  const seconds = Math.ceil(windowMs / 1000);
  if (seconds % 3600 === 0) return `${seconds / 3600} h` as Duration;
  if (seconds % 60 === 0) return `${seconds / 60} m` as Duration;
  return `${seconds} s` as Duration;
};

const buildKey = (req: Request, keyType: KeyType): string => {
  const ip = ipKeyGenerator(req.ip ?? "");

  switch (keyType) {
    case "user": {
      if (req.user?.id) return `user:${req.user.id}`;
      return `ip:${ip}`;
    }
    case "email": {
      const email = getEmailFromRequest(req);
      if (email) return `email:${email}`;
      return `ip:${ip}`;
    }
    case "emailIp": {
      const email = getEmailFromRequest(req);
      if (email) return `email:${email}:ip:${ip}`;
      return `ip:${ip}`;
    }
    case "ip":
    default:
      return `ip:${ip}`;
  }
};

const setRateLimitHeaders = (
  res: Response,
  limit: number,
  remaining: number,
  reset: number
): void => {
  res.setHeader("RateLimit-Limit", limit);
  res.setHeader("RateLimit-Remaining", Math.max(0, remaining));
  res.setHeader("RateLimit-Reset", Math.ceil(reset / 1000));
};

export const createLimiter = ({
  name,
  windowMs,
  max,
  keyType = "ip",
}: LimiterOptions): RequestHandler => {
  const ratelimit = new Ratelimit({
    redis,
    prefix: `rl:${name}`,
    limiter: Ratelimit.fixedWindow(max, windowToDuration(windowMs)),
    analytics: false,
  });

  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const identifier = buildKey(req, keyType);
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

    setRateLimitHeaders(res, limit, remaining, reset);

    if (!success) {
      return next(new AppError(MESSAGES.TOO_MANY_REQUEST, HTTP_STATUS.TOO_MANY_REQUESTS));
    }

    next();
  });
};

/** General API traffic for authenticated routes */
export const apiLimiter = createLimiter({
  name: "api",
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyType: "user",
});

/** Optional app-wide ceiling (mount on /api if needed) */
export const globalLimiter = createLimiter({
  name: "global",
  windowMs: 15 * 60 * 1000,
  max: 300,
  keyType: "ip",
});

export const loginLimiter = createLimiter({
  name: "login",
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyType: "emailIp",
});

export const otpLimiter = createLimiter({
  name: "otp",
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyType: "email",
});

export const publicAuthLimiter = createLimiter({
  name: "public-auth",
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyType: "email",
});

export const sensitiveLimiter = createLimiter({
  name: "sensitive",
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyType: "user",
});

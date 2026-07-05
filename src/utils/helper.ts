import { randomInt } from "node:crypto";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import AppError from "./appError.js";
import { HTTP_STATUS, MESSAGES } from "./constants.js";

interface RefreshPayload extends jwt.JwtPayload {
  userId: string;
}

export const generateOTP = (): string => {
  return randomInt(100000, 1000000).toString();
};

export const hashSecret = async (val: string) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(val, salt);
};

export const verifySecret = async (plainValue: string, hashedValue: string) => {
  return await bcrypt.compare(plainValue, hashedValue);
};

export const verifyToken = (token: string, secretKey: string) => {
  try {
    const decoded = jwt.verify(token, secretKey);

    if (typeof decoded === "string") {
      throw new Error();
    }

    return decoded as RefreshPayload;
  } catch {
    throw new AppError(MESSAGES.AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED);
  }
};

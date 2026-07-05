import jwt from "jsonwebtoken";

import env from "../config/env.js";

export const generateAccessToken = (userId: string): string => {
  if (!env.JWT_ACCESS_SECRET || !env.JWT_ACCESS_EXPIRES_IN) {
    throw new Error("JWT config is not defined");
  }

  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
};

export const generateRefreshToken = (userId: string): string => {
  if (!env.JWT_REFRESH_SECRET || !env.JWT_REFRESH_EXPIRES_IN) {
    throw new Error("JWT config is not defined");
  }

  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
};

import { NextFunction, Request, Response } from "express";
import env from "../config/env.js";
import AppError from "../utils/appError.js";
import { HTTP_STATUS } from "../utils/constants.js";
import { MESSAGES } from "../utils/constants.js";
import camelcaseKeys from "camelcase-keys";

interface PostgresError extends Error {
  detail: string;
}

const handleMulterError = () => {
  return new AppError(MESSAGES.MAX_IMAGES_EXCEEDED, HTTP_STATUS.BAD_REQUEST);
};

const handleUniqueError = (err: PostgresError) => {
  const detail = err.detail;

  const match = detail?.match(/\((.*?)\)=/);
  const field = match?.[1] ?? "field";

  return new AppError(
    MESSAGES.VALIDATION_FAILED,
    HTTP_STATUS.BAD_REQUEST,
    camelcaseKeys({
      [field]: `This ${field.replace("_", " ")} is already in use`,
    })
  );
};

const handleJWTError = () => {
  return new AppError(MESSAGES.AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED);
};

const isPostgresError = (err: Error): err is PostgresError => {
  return "code" in err;
};

const errorDev = (err: AppError, res: Response) => {
  const error = { ...err, ...err.details };
  error.details = undefined;

  res.status(err.statusCode || HTTP_STATUS.SERVER_ERROR).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error,
  });
};

const errorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      ...(err.details && { error: err.details }),
    });
  } else {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong 💥",
    });
  }
};

export default (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  const error =
    err instanceof AppError ? err : new AppError(err.message, HTTP_STATUS.SERVER_ERROR, { ...err });

  error.statusCode = error.statusCode || HTTP_STATUS.SERVER_ERROR;
  error.status = error.status || "error";

  if (env.STAGE === "development") {
    errorDev(error, res);
  } else if (env.STAGE === "production") {
    let processedError: AppError = error;

    // Postgres error
    if (isPostgresError(err)) {
      if ((err as any).code === "23505") processedError = handleUniqueError(err);
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
      processedError = handleJWTError();

    if (error.details && error.details.code === "LIMIT_UNEXPECTED_FILE")
      processedError = handleMulterError();
    errorProd(processedError, res);
  }
};

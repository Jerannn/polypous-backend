import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError.js";
import { HTTP_STATUS } from "../utils/constants.js";
import { ZodError, ZodType } from "zod";

export const validateRequest =
  ({ body, query, params }: { body?: ZodType; query?: ZodType; params?: ZodType }) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (body) {
      const result = body.safeParse(req.body);

      if (!result.success) return handleValidationError(result.error, next);

      req.body = result.data;
    }

    if (query) {
      const result = query.safeParse(req.query);

      if (!result.success) return handleValidationError(result.error, next);

      req.validatedQuery = result.data as Record<string, unknown>;
    }

    if (params) {
      const result = params.safeParse(req.params);

      if (!result.success) return handleValidationError(result.error, next);

      req.validatedParams = result.data as Record<string, unknown>;
    }

    next();
  };

function handleValidationError(error: ZodError, next: NextFunction) {
  const errors: Record<string, string> = {};

  // Extract error messages
  for (const issue of error.issues) {
    const field = String(issue.path[0]);

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  // Send a response if validation fails
  next(new AppError("Validation failed", HTTP_STATUS.BAD_REQUEST, errors));
}

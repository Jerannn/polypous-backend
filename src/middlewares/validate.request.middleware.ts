import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const validateRequest =
  (schema: any) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const validationResult = schema.safeParse({
      ...req.body,
    });

    if (!validationResult.success) {
      // Extract error messages
      const errorMessages = validationResult.error!.issues.reduce(
        (acc: Record<string, string>, err: Record<string, string>) => ({
          ...acc,
          [err.path[0]]: err.message,
        }),
        {}
      );

      // Send a response if validation fails
      next(new AppError("Validation failed", HTTP_STATUS.BAD_REQUEST, errorMessages));
      return;
    }

    // If validation is successful, proceed to the next middleware
    req.body = validationResult.data;
    next();
  };

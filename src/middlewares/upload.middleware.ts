import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";

import AppError from "../utils/appError.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Memory storage keeps files as buffer in memory
const storage = multer.memoryStorage();

// File filter to restrict uploads to images
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only JPG, PNG, and WEBP images are allowed.",
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
}).single("logo");

/**
 * Middleware to parse single file upload named "logo" and validate limits.
 */
export const uploadLogo = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError(
              "File size too large. Maximum allowed size is 2MB.",
              HTTP_STATUS.BAD_REQUEST
            )
          );
        }
        return next(new AppError(err.message, HTTP_STATUS.BAD_REQUEST));
      }
      return next(err);
    }
    next();
  });
};

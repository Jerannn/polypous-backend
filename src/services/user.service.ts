import { Request } from "express";

import AuthModel from "../models/auth.model.js";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { HTTP_STATUS, MESSAGES } from "../utils/constants.js";
import { verifySecret } from "../utils/helper.js";

export default class UserService {
  static async handleUpdateUser(req: Request) {
    const userId = req.user.id;

    const updatedUser = await UserModel.updateById(userId, req.body);

    return updatedUser;
  }

  static async handleUpdateBusiness(req: Request) {
    const userId = req.user.id;

    const updatedBusiness = await UserModel.updateBusiness(userId, req.body);

    return updatedBusiness;
  }

  static async handleGetBusiness(userId: string) {
    const business = await UserModel.getBusiness(userId);

    return business;
  }

  static async handleVerifyPassword(userId: string, password: string) {
    const user = await AuthModel.findById(userId);

    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    const isPasswordCorrect = await verifySecret(password, user.passwordHash as string);

    if (!isPasswordCorrect) {
      throw new AppError("Validation failed", HTTP_STATUS.BAD_REQUEST, {
        message: MESSAGES.INVALID_PASSWORD,
      });
    }

    return { verified: true };
  }

  static async handleDeleteUser(userId: string) {
    const user = await AuthModel.findById(userId);

    if (!user) {
      throw new AppError("User not found.", HTTP_STATUS.NOT_FOUND);
    }

    await AuthModel.deleteById(userId);
  }

  static async handleUploadBusinessLogo(req: Request) {
    const userId = req.user.id;
    console.log(req.file);
    // 1. Check if business exists
    const business = await UserModel.getBusiness(userId);
    if (!business) {
      throw new AppError(
        "Business profile not found. Please set up your business profile first.",
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (!req.file) {
      throw new AppError("No logo file provided.", HTTP_STATUS.BAD_REQUEST);
    }

    // 2. Upload new logo to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, "polypous/logos");

    // 3. Update business in DB
    const updatedBusiness = await UserModel.updateBusinessLogo(
      userId,
      uploadResult.secure_url,
      uploadResult.public_id
    );

    // 4. Delete old logo from Cloudinary if it existed
    if (business.publicId) {
      try {
        await deleteFromCloudinary(business.publicId);
      } catch (err) {
        console.error("Failed to delete old business logo from Cloudinary:", err);
      }
    }

    return updatedBusiness;
  }

  static async handleDeleteBusinessLogo(req: Request) {
    const userId = req.user.id;

    // 1. Check if business exists
    const business = await UserModel.getBusiness(userId);
    if (!business) {
      throw new AppError(
        "Business profile not found. Please set up your business profile first.",
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 2. Delete logo from Cloudinary if it exists
    if (business.publicId) {
      try {
        await deleteFromCloudinary(business.publicId);
      } catch (err) {
        console.error("Failed to delete business logo from Cloudinary:", err);
      }
    }

    // 3. Clear logo fields in DB
    const updatedBusiness = await UserModel.deleteBusinessLogo(userId);

    return updatedBusiness;
  }
}

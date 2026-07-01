import { Request } from "express";
import UserModel from "../models/user.model.js";
import AuthModel from "../models/auth.model.js";
import { verifySecret } from "../utils/helper.js";
import AppError from "../utils/appError.js";
import { HTTP_STATUS, MESSAGES } from "../utils/constants.js";

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
}

import { Request } from "express";
import UserModel from "../models/user.model.js";

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
}

import { Request } from "express";
import UserModel from "../models/user.model.js";

export default class UserService {
  static async updateUser(req: Request) {
    const userId = req.user.id;

    const updatedUser = await UserModel.updateById(userId, req.body);

    return updatedUser;
  }
}

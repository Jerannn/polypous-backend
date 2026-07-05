import env from "../config/env.js";
import redis from "../lib/redis/redis.client.js";
import { redisKeys } from "../lib/redis/redis.keys.js";
import AuthModel from "../models/auth.model.js";
import { Register, User } from "../types/auth.types.js";
import AppError from "../utils/appError.js";
import { HTTP_STATUS, MESSAGES, OTP } from "../utils/constants.js";
import { generateOTP, hashSecret, verifySecret, verifyToken } from "../utils/helper.js";

export default class AuthService {
  static async createAccount(data: Register): Promise<User> {
    const newOtp = generateOTP();
    const newUser = await AuthModel.create(data);

    if (!newUser) {
      throw new AppError(MESSAGES.REGISTRATION_FAILED, HTTP_STATUS.BAD_REQUEST);
    }

    console.log("OTP:", newOtp);

    const key = redisKeys.otp("register", newUser.email);
    const hashedOtp = await hashSecret(newOtp);

    await Promise.all([
      redis.hset(key, {
        email: newUser.email,
        otp: hashedOtp,
        attempts: 0,
        expiresAt: new Date(Date.now() + OTP.EXPIRATION_TIME),
      }),
      redis.expire(key, OTP.EXPIRATION_TIME / 1000),
    ]);

    // TODO: send OTP via email service
    // 4. Send verification email
    //   await OTPService.handleEmail(newUser.email, newOtp);

    newUser.passwordHash = undefined;

    return newUser;
  }

  static async authenticateUser(email: string, password: string): Promise<User> {
    const user = await AuthModel.findByEmail(email);

    if (!user || !(await verifySecret(password, user.passwordHash as string))) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED, {
        message: MESSAGES.INVALID_CREDENTIALS,
      });
    }

    return user;
  }

  static async handleRefreshToken(token: string): Promise<User> {
    if (!token) {
      throw new AppError(MESSAGES.AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED);
    }

    const payload = verifyToken(token, env.JWT_REFRESH_SECRET as string);

    const user = await AuthModel.findById(payload.userId);

    if (!user || !(await verifySecret(token, user.refreshToken as string))) {
      throw new AppError(MESSAGES.AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED);
    }

    return user;
  }

  static async handleLogout(token: string) {
    if (!token) {
      throw new AppError(MESSAGES.AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED);
    }

    const payload = verifyToken(token, env.JWT_REFRESH_SECRET as string);

    await AuthModel.removeRefreshToken(payload.userId);
  }

  //   static async requestPasswordReset(email: string, res: Response) {
  //     const user = await Auth.findByEmail(email);

  //     // Prevent user enumeration
  //     if (!user) {
  //       return res.status(HTTP_STATUS.NO_CONTENT).send();
  //     }

  //     const key = redisKeys.otp("reset", email);

  //     // Do not issue a new OTP if one is still valid
  //     if (await redis.exists(key)) {
  //       return res.status(HTTP_STATUS.NO_CONTENT).send();
  //     }
  //     const newOtp = generateOTP();
  //     const hashedOtp = await hashSecret(newOtp);
  //     console.log("OTP:", newOtp);

  //     await Promise.all([
  //       redis.hset(key, {
  //         email: email,
  //         otp: hashedOtp,
  //         attempts: 0,
  //       }),
  //       redis.expire(key, OTP_EXPIRATION_TIME),
  //     ]);

  //     // TODO: send OTP via email service
  //     // 4. Send verification email
  //     // await OTPService.handleEmail(user.email, newOtp);
  //   }

  //   static async confirmPasswordResetOtp(email: string, otp: string): Promise<string> {
  //     const success = await OTPService.verifyOtp(email, otp, "reset");
  //     const rawToken = randomBytes(32).toString("hex");
  //     const hashedToken = await hashSecret(rawToken);

  //     await redis.set(redisKeys.resetToken(success.email), hashedToken, {
  //       ex: RESET_TOKEN_EXPIRATION_TIME,
  //     });

  //     return rawToken;
  //   }

  //   static async completePasswordReset(email: string, password: string, token: string) {
  //     const key = redisKeys.resetToken(email);
  //     console.log({ email, password, token });
  //     // Validate reset token (stored hashed in Redis, expires automatically)
  //     const hashedToken = await redis.get<string>(key);

  //     if (!hashedToken || !(await verifySecret(token, hashedToken))) {
  //       throw new AppError(MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
  //     }

  //     const user = await Auth.findByEmail(email);

  //     if (!user) {
  //       throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  //     }

  //     // Prevent password reuse
  //     const isSamePassword = await verifySecret(password, user.password_hash as string);
  //     if (isSamePassword) {
  //       throw new AppError(MESSAGES.PASSWORD_REUSE, HTTP_STATUS.BAD_REQUEST);
  //     }

  //     const hashedPassword = await hashSecret(password);
  //     await Auth.updatePassword(user.id, hashedPassword);

  //     // Invalidate token after successful use
  //     await redis.del(key);
  //   }

  //   static async changePassword(
  //     currentPassword: string,
  //     newPassword: string,
  //     userId: string
  //   ): Promise<User> {
  //     const user = await Auth.findById(userId);

  //     const isCurrentPasswordCorrect = await verifySecret(
  //       currentPassword,
  //       user.password_hash as string
  //     );

  //     if (!isCurrentPasswordCorrect) {
  //       throw new Error("Current password is incorrect");
  //     }

  //     const isSamePassword = await verifySecret(newPassword, user.password_hash as string);

  //     if (isSamePassword) {
  //       throw new Error("New password cannot be the same as the current password");
  //     }

  //     const hashedPassword = await hashSecret(newPassword);
  //     const updatedUser = await Auth.updatePassword(user.id, hashedPassword);

  //     updatedUser.password_hash = undefined;

  //     return updatedUser;
  //   }
}

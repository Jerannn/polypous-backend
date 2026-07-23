import { sendEmail } from "../lib/email/email.client.js";
import { getOtpTemplate } from "../lib/email/email.templates.js";
import redis from "../lib/redis/redis.client.js";
import { redisKeys } from "../lib/redis/redis.keys.js";
import AppError from "../utils/appError.js";
import { HTTP_STATUS, MESSAGES, OTP } from "../utils/constants.js";
import { generateOTP, hashSecret, verifySecret } from "../utils/helper.js";

export type VerificationPayload = {
  email: string;
  otp: string;
  type: string;
  attempts: number;
  expiresAt: Date | string;
};

export class OTPService {
  static async handleEmail(email: string, otp: string, type: string) {
    const html = getOtpTemplate(otp, type);

    await sendEmail({
      to: email,
      subject: "Your Polypous verification code (expires in 15 minutes)",
      text: `
          Welcome to Polypous!
          Your verification code is: ${otp}
          This code will expire in 15 minutes.
          For your security, do not share this code with anyone.
          `,
      html,
    });
  }

  static async verifyOtp(identifier: string, otp: string, type: string) {
    const key = redisKeys.otp(type, identifier);

    const storeOtp = await redis.hgetall<VerificationPayload>(key);

    if (!storeOtp) {
      throw new AppError("Validation failed", HTTP_STATUS.BAD_REQUEST, {
        otp: MESSAGES.INVALID_OTP,
      });
    }

    if (Number(storeOtp.attempts) >= OTP.MAX_ATTEMPTS) {
      throw new AppError("Validation failed", HTTP_STATUS.TOO_MANY_REQUESTS, {
        otp: MESSAGES.TOO_MANY_REQUEST,
      });
    }

    if (!(await verifySecret(otp, storeOtp.otp))) {
      await redis.hincrby(key, "attempts", 1);
      throw new AppError("Validation failed", HTTP_STATUS.BAD_REQUEST, {
        otp: MESSAGES.INVALID_OTP,
      });
    }

    // remove after successful verification
    await redis.del(key);

    return storeOtp;
  }

  static async resendOtp(email: string, action: string) {
    const key = redisKeys.otp(action, email);

    // Prevent issuing multiple active OTPs at the same time
    if (await redis.exists(key)) {
      throw new AppError("Validation failed", HTTP_STATUS.BAD_REQUEST, {
        otp: MESSAGES.OTP_COOLDOWN,
      });
    }

    const newOtp = generateOTP();
    const hashedOtp = await hashSecret(newOtp);
    await Promise.all([
      redis.hset(key, {
        email: email,
        otp: hashedOtp,
        attempts: 0,
        expiresAt: new Date(Date.now() + OTP.EXPIRATION_TIME),
      }),
      redis.expire(key, OTP.EXPIRATION_TIME / 1000),
    ]);

    if (action === "register") {
      try {
        await this.handleEmail(email, newOtp, action);
      } catch (error) {
        throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.BAD_REQUEST);
      }
    } else if (action === "reset") {
      try {
        await this.handleEmail(email, newOtp, action);
      } catch (error) {
        throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.BAD_REQUEST);
      }
    }

    return this.getOtp(email, action);
  }

  static async getOtp(email: string, action: string) {
    const key = redisKeys.otp(action, email);
    const storeOtp = await redis.hgetall<VerificationPayload>(key);

    if (!storeOtp) {
      throw new AppError("Validation failed", HTTP_STATUS.BAD_REQUEST, {
        otp: MESSAGES.INVALID_OTP,
      });
    }

    const otp = {
      email: storeOtp.email,
      expiresAt: storeOtp.expiresAt,
    };

    return otp;
  }
}

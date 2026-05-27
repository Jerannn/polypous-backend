export const redisKeys = {
  otp: (action: string, email: string) => `auth:otp:${action}:${email}`,
  resetToken: (email: string) => `auth:reset:token:${email}`,
};

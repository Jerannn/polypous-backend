export const redisKeys = {
  otp: (action: string, identifier: string) => `auth:otp:${action}:${identifier}`,
  resetToken: (email: string) => `auth:reset:token:${email}`,
};

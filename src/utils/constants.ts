export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
} as const;

export const MESSAGES = {
  REGISTRATION_FAILED: "Registration failed, please try again",
  INVALID_CREDENTIALS: "Incorrect email or password, please try again",
  AUTH_FAILED: "Authentication failed. Please log in again.",
  INVALID_OTP:
    "Invalid code or has expired. Please check the code sent to your email and try again.",
  TOO_MANY_REQUEST: "Too many requests. Try again later.",
  OTP_COOLDOWN: "Please wait 10 minutes before requesting again",
  SERVER_ERROR: "Something went wrong, please try again",
  VALIDATION_FAILED: "Validation failed",
  USER_NOT_FOUND: "No account found. Check your email address and try again.",
  PASSWORD_REUSE: "Cannot reuse old password",
  MAX_IMAGES_EXCEEDED: `You can upload up to 2 images only`,
} as const;

export const OTP = {
  EXPIRATION_TIME: 2 * 60 * 1000, // 10 minutes
  COOLDOWN_TIME: 2 * 60 * 1000, // 10 minutes
  MAX_OTP_RESEND_ATTEMPTS: 5,
  MAX_ATTEMPTS: 5,
  OTP_EXPIRATION_TIME: 2 * 60, // 2 minutes
  RESET_TOKEN_EXPIRATION_TIME: 10 * 60, // 10 minutes
} as const;

export const LIMIT = 10;

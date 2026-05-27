export default class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  details: Record<string, unknown> | undefined;

  public static isAppError(err: any): err is AppError {
    return err instanceof AppError;
  }

  constructor(message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

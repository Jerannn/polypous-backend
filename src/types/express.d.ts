import { User } from "./auth.types.ts";

declare global {
  namespace Express {
    interface Request {
      user: User;
      validatedQuery: Record<string, unknown>;
      validatedParams: Record<string, unknown>;
    }
  }
}

export {};

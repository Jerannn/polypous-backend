import { User } from "./auth.types.ts";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export {};

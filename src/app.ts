import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import env from "./config/env.js";

// Routes
import authRouter from "./routes/auth.route.js";
import UserRouter from "./routes/user.route.js";
import ClientRouter from "./routes/client.route.js";

// Error handler
import globalErrorHandler from "./controllers/error.controller.js";
import AppError from "./utils/appError.js";
// import { globalLimiter } from "./middleware/rate-limiter.middleware.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN_URL,
    credentials: true,
  })
);

if (env.STAGE === "development") {
  app.use(morgan("dev"));
}

if (env.STAGE === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// API endpoints
// app.use("/api", globalLimiter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/clients", ClientRouter);
// app.use("/api/v1/properties", propertiesRouter);

// Route not found
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;

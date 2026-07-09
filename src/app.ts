import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

import env from "./config/env.js";
// Error handler
import globalErrorHandler from "./controllers/error.controller.js";
// Routes
import authRouter from "./routes/auth.route.js";
import clientRouter from "./routes/client.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import invoiceRouter from "./routes/invoice.route.js";
import paymentRouter from "./routes/payment.route.js";
import userRouter from "./routes/user.route.js";
import analyticsRouter from "./routes/analytics.route.js";

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
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/analytics", analyticsRouter);

// Route not found
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;

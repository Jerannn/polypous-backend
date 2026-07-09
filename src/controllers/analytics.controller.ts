import { NextFunction, Response, Request } from "express";
import catchAsync from "../utils/catchAsync.js";
import { HTTP_STATUS } from "../utils/constants.js";
import AnalyticsService from "../services/analytics.service.js";

export const getAnalytics = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const analytics = await AnalyticsService.handleGetAnalytics(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: {
      analytics,
    },
  });
});

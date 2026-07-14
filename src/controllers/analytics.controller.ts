import { NextFunction, Request,Response } from "express";

import AnalyticsService from "../services/analytics.service.js";
import catchAsync from "../utils/catchAsync.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const getAnalytics = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const query = req.query;

  console.log("QUERY: ", query);
  const analytics = await AnalyticsService.handleGetAnalytics(req.user.id, query);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: {
      analytics,
    },
  });
});

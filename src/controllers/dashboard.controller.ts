import { NextFunction, Response, Request } from "express";
import catchAsync from "../utils/catchAsync.js";
import DashboardService from "../services/dashboard.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const getOverview = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const overview = await DashboardService.getOverview(req.user.id as string);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { overview },
  });
});

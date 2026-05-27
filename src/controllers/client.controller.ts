import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import ClientService from "../services/client.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const createClient = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  console.log(req.body);
  const newClient = await ClientService.handleCreateClient(req);

  res.status(HTTP_STATUS.CREATED).json({
    status: "success",
    data: { client: newClient },
  });
});

export const getClients = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { clients, meta } = await ClientService.handleGetClients(req);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { meta, clients },
  });
});

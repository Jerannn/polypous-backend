import { NextFunction, Request, Response } from "express";

import ClientService from "../services/client.service.js";
import catchAsync from "../utils/catchAsync.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const createClient = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
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

export const updateClient = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const updatedClient = await ClientService.handleUpdateClient(req);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { client: updatedClient },
  });
});

export const deleteClient = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { id } = req.params;

  const isDeleted = await ClientService.handleDeleteClient(id as string);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { isDeleted },
  });
});

export const getOptions = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { options, nextCursor } = await ClientService.handleGetOptions(req);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { options, nextCursor },
  });
});

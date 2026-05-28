import { Request } from "express";
import ClientModel from "../models/client.model.js";
import { ClientPayload } from "../types/client.types.js";

export default class ClientService {
  static async handleCreateClient(req: Request) {
    const payload = req.body as ClientPayload;
    const userId = req.user.id;
    const newClient = await ClientModel.create(payload, userId);

    return newClient;
  }

  static async handleGetClients(req: Request) {
    const userId = req.user.id;

    const { page, limit, search } = req.validatedQuery;

    const parsedLimit = Number(limit);
    const parsedPage = Number(page);

    const offset = (parsedPage - 1) * parsedLimit;

    const clients = await ClientModel.findAllByUserId(
      userId,
      parsedLimit,
      offset,
      search as string
    );

    const total = clients[0]?.totalCount ?? 0;
    const totalPage = Math.ceil(total / parsedLimit);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage,
        currentPage: parsedPage,
        nextPage: parsedPage < totalPage ? parsedPage + 1 : null,
        prevPage: parsedPage > 1 ? parsedPage - 1 : null,
      },
      clients,
    };
  }

  static async handleUpdateClient(req: Request) {
    const payload = req.body as ClientPayload;
    const id = req.validatedParams.id as string;

    const updatedClient = await ClientModel.update(id, payload);

    return updatedClient;
  }

  static async handleDeleteClient(id: string) {
    const deletedClient = await ClientModel.delete(id);

    return deletedClient;
  }
}

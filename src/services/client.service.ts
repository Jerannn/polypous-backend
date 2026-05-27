import { Request } from "express";
import ClientModel from "../models/client.model.js";
import { CreateClientPayload } from "../types/client.types.js";
import { LIMIT } from "../utils/constants.js";
import { querySchema } from "../schemas/client.schema.js";

export default class ClientService {
  static async handleCreateClient(req: Request) {
    const payload = req.body as CreateClientPayload;
    const userId = req.user.id;
    const newClient = await ClientModel.create(payload, userId);

    return newClient;
  }

  static async handleGetClients(req: Request) {
    const userId = req.user.id;
    const queryParsed = querySchema.parse(req.query);
    const { page, limit, search } = queryParsed;

    const offset = (page - 1) * limit;

    const clients = await ClientModel.findAllByUserId(userId, limit, offset, search);

    const total = clients[0]?.totalCount ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      meta: {
        page,
        limit,
        total,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
      clients,
    };
  }
}

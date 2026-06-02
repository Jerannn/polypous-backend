import { Request } from "express";
import ClientModel from "../models/client.model.js";
import { ClientPayload } from "../types/client.types.js";
import { DEFAULT_LIMIT_OPTIONS } from "../utils/constants.js";

export default class ClientService {
  static async handleCreateClient(req: Request) {
    const payload = req.body as ClientPayload;
    const userId = req.user.id;

    return await ClientModel.create(payload, userId);
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

    return await ClientModel.update(id, payload);
  }

  static async handleDeleteClient(id: string) {
    return await ClientModel.delete(id);
  }

  static async handleGetOptions(req: Request) {
    const userId = req.user.id;
    const { createdAt, id, limit = DEFAULT_LIMIT_OPTIONS, query } = req.query;

    const pageSize = Number(limit);
    const fetchLimit = pageSize + 1;
    const cursor = {
      id: id as string,
      createdAt: createdAt as string,
    };

    const options = await ClientModel.findOptions(userId, cursor, fetchLimit, query as string);

    let nextCursor = null;

    if (options.length === fetchLimit) {
      const lastOption = options[pageSize - 1];

      nextCursor = {
        id: lastOption.id,
        createdAt: lastOption.createdAt,
      };

      options.pop();
    }

    return { options, nextCursor };
  }
}

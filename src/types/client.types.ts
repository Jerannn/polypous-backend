import { z } from "zod";
import { createClientSchema } from "../schemas/client.schema.js";

export type CreateClientPayload = z.infer<typeof createClientSchema>;

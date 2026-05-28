import { z } from "zod";
import { clientSchema } from "../schemas/client.schema.js";

export type ClientPayload = z.infer<typeof clientSchema>;

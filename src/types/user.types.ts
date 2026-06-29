import { z } from "zod";
import { profileSchema } from "../schemas/user.schema.js";

export type ProfileInput = z.infer<typeof profileSchema>;

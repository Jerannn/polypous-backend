import { z } from "zod";

import { businessSchema, profileSchema } from "../schemas/user.schema.js";

export type ProfileInput = z.infer<typeof profileSchema>;
export type BusinessInput = z.infer<typeof businessSchema>;

export type Business = BusinessInput & {
  id: string;
  userId: string;
  brandUrl: string | null;
  publicId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

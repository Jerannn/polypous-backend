import { z } from "zod";

export const filterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

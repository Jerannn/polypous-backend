import { z } from "zod";

export const filterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

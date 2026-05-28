import express from "express";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "../controllers/client.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { clientSchema, clientParamsSchema, querySchema } from "../schemas/client.schema.js";
const router = express.Router();

router.post("/", protect, validateRequest({ body: clientSchema }), createClient);
router.get("/", protect, validateRequest({ query: querySchema }), getClients);
router.delete("/:id", protect, validateRequest({ params: clientParamsSchema }), deleteClient);
router.patch(
  "/:id",
  protect,
  validateRequest({ body: clientSchema, params: clientParamsSchema }),
  updateClient
);

export default router;

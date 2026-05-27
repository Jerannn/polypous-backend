import express from "express";
import { createClient, getClients } from "../controllers/client.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.request.middleware.js";
import { createClientSchema, querySchema } from "../schemas/client.schema.js";

const router = express.Router();

router.post("/", protect, validateRequest({ body: createClientSchema }), createClient);
router.get("/", protect, validateRequest({ query: querySchema }), getClients);

export default router;

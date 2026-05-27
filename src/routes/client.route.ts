import express from "express";
import { createClient, getClients } from "../controllers/client.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createClient);
router.get("/", protect, getClients);

export default router;

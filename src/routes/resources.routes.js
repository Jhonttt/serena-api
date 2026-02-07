import express from "express";
import { createResource, getResources } from "../controllers/resources.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta para listar recursos
router.get("/", getResources);

// Ruta para crear recursos (protegida)
router.post("/", authenticate, createResource);

export default router;

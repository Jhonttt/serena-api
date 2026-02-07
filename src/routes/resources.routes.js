import express from "express";
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/resources.controller.js";
import { authRequired } from "../middleware/validateToken.js";

const router = express.Router();

// Obtener todos los recursos (público o protegido según tu preferencia)
router.get("/", getResources);

// Crear recurso (requiere autenticación)
router.post("/", authRequired, createResource);

// Obtener recurso por ID
router.get("/:id", getResourceById);

// Actualizar recurso (requiere autenticación)
router.put("/:id", authRequired, updateResource);

// Eliminar recurso (requiere autenticación)
router.delete("/:id", authRequired, deleteResource);

export default router;

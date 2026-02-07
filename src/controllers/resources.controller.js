import { Resource, User } from "../db/models/index.js";
import { createResourceSchema } from "../schemas/resource.schema.js";

// Obtener todos los recursos
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json(resources);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Crear un nuevo recurso
export const createResource = async (req, res) => {
  try {
    // 1. Validar datos con Zod
    const parsed = createResourceSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json(errors);
    }

    const { title, description, url, type_resource } = parsed.data;

    // 2. Verificar si ya existe por título
    const existingByTitle = await Resource.findOne({ where: { title } });
    if (existingByTitle) {
      return res.status(409).json({ message: "Ya existe un recurso con ese título" });
    }

    // 3. Verificar si ya existe por URL
    const existingByUrl = await Resource.findOne({ where: { url } });
    if (existingByUrl) {
      return res.status(409).json({ message: "Ya existe un recurso con esa URL" });
    }

    // 4. Crear el recurso
    const resourceSaved = await Resource.create({
      title,
      description,
      url,
      type_resource,
      user_id: req.user.id, // Viene del middleware de autenticación
    });

    return res.status(201).json({
      message: "Recurso creado exitosamente",
      resource: {
        id: resourceSaved.id_resource,
        title: resourceSaved.title,
        description: resourceSaved.description,
        url: resourceSaved.url,
        type_resource: resourceSaved.type_resource,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener un recurso por ID
export const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },
      ],
    });

    if (!resource) {
      return res.status(404).json({ message: "Recurso no encontrado" });
    }

    return res.json(resource);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar un recurso
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ message: "Recurso no encontrado" });
    }

    // Verificar permisos (solo el creador o admin puede editar)
    if (resource.user_id !== req.user.id && req.user.role_id !== 1) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para actualizar este recurso" });
    }

    // Validar datos
    const parsed = createResourceSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json(errors);
    }

    const { title, description, url, type_resource } = parsed.data;

    // Verificar duplicados si se cambia el título
    if (title && title !== resource.title) {
      const existingByTitle = await Resource.findOne({ 
        where: { title },
      });
      if (existingByTitle) {
        return res.status(409).json({ message: "Ya existe un recurso con ese título" });
      }
    }

    // Verificar duplicados si se cambia la URL
    if (url && url !== resource.url) {
      const existingByUrl = await Resource.findOne({ 
        where: { url },
      });
      if (existingByUrl) {
        return res.status(409).json({ message: "Ya existe un recurso con esa URL" });
      }
    }

    // Actualizar campos
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (url) resource.url = url;
    if (type_resource) resource.type_resource = type_resource;

    await resource.save();

    return res.json({
      message: "Recurso actualizado exitosamente",
      resource: {
        id: resource.id_resource,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        type_resource: resource.type_resource,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar un recurso
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ message: "Recurso no encontrado" });
    }

    // Verificar permisos (solo el creador o admin puede eliminar)
    if (resource.user_id !== req.user.id && req.user.role_id !== 1) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar este recurso" });
    }

    await resource.destroy();

    return res.json({ message: "Recurso eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
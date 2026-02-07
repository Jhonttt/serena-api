import { Resource } from "../db/models/index.js";

// Obtener todos los recursos
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los recursos" });
  }
};

// Crear un recurso
export const createResource = async (req, res) => {
  try {
    const { title, description, url, type_resource } = req.body;

    const [resource, created] = await Resource.findOrCreate({
      where: { title },
      defaults: { title, description, url, type_resource },
    });

    if (!created) {
      return res.status(400).json({ message: "El recurso ya existe" });
    }

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el recurso" });
  }
};

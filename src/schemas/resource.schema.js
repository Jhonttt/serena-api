import { z } from "zod";

export const createResourceSchema = z.object({
  title: z
    .string({
      required_error: "El título es requerido",
    })
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres"),
  
  description: z
    .string({
      required_error: "La descripción es requerida",
    })
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(255, "La descripción no puede exceder 255 caracteres"),
  
  url: z
    .string({
      required_error: "La URL es requerida",
    })
    .url("Debe ser una URL válida"),
  
  type_resource: z
    .string({
      required_error: "El tipo de recurso es requerido",
    })
    .refine(
      (val) => ["Audio", "Video", "Lectura"].includes(val),
      "Tipo de recurso no válido. Debe ser: Audio, Video o Lectura"
    ),
});
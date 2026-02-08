import { z } from "zod";
import { calculateAge } from "../utils/age.js";

const esPhone = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^(\+34)?[6789]\d{8}$/.test(val.replace(/\s+/g, "")),
    { message: "Teléfono inválido" },
  );

const educationLevelSchema = z.enum(
  ["primaria", "secundaria", "bachillerato", "universidad", "otro"],
  { error: "Education level is required" },
);

const relationshipSchema = z.enum(
  ["padre", "madre", "tutor_legal", "abuelo", "hermano_mayor", "otro"],
  { error: "Relationship is required" },
);

export const registerSchema = z
  .object({
    email: z.email({
      required_error: "Email is required",
    }),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    first_name: z
      .string({
        required_error: "First name is required",
      })
      .min(1, "First name cannot be empty"),
    last_name: z
      .string({
        required_error: "Last name is required",
      })
      .min(1, "Last name cannot be empty"),
    birth_day: z
      .string({
        required_error: "Birth date is required",
      })
      .refine((val) => calculateAge(val) >= 12, {
        message: "La edad mínima es 12 años",
      }),
    education_level: educationLevelSchema,

    full_name_tutor: z.string().optional(),
    phone_tutor: esPhone, // ✅ aquí usas el validador
    relationship: relationshipSchema.optional(),
    psychological_issue: z.string().max(150).optional(),
    email_tutor: z.email().optional(),
  })
  .superRefine((data, ctx) => {
    const age = calculateAge(data.birth_day);

    if (age < 18) {
      // full_name_tutor obligatorio y con al menos un espacio
      if (!data.full_name_tutor || data.full_name_tutor.trim() === "") {
        ctx.addIssue({
          path: ["full_name_tutor"],
          message: "Nombre del tutor es obligatorio",
        });
      } else if (!data.full_name_tutor.trim().includes(" ")) {
        ctx.addIssue({
          path: ["full_name_tutor"],
          message: "Nombre completo del tutor",
        });
      }

      // phone_tutor obligatorio (y ya se valida formato por esPhone si viene)
      if (!data.phone_tutor) {
        ctx.addIssue({
          path: ["phone_tutor"],
          message: "Teléfono es obligatorio",
        });
      }

      // relationship obligatorio
      if (!data.relationship) {
        ctx.addIssue({
          path: ["relationship"],
          message: "Relationship is required",
        });
      }
    }
  });

export const loginSchema = z.object({
  email: z.email({
    required_error: "Email is required",
  }),
  password: z.string({
    required_error: "Password is required",
  }),
});

export const updatePersonalInfoSchema = z.object({
  first_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .optional()
    .or(z.literal("")),

  last_name: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .optional()
    .or(z.literal("")),

  email: z.string().email("Email inválido").optional().or(z.literal("")),

  birth_day: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // si es opcional y está vacío, pasa
        const age = calculateAge(val);
        return age >= 5 && age <= 120;
      },
      { message: "La edad mínima es 12 años" },
    )
    .refine(
      (val) => {
        if (!val) return true;
        const selected = new Date(val);
        const today = new Date();
        return selected < today;
      },
      { message: "La fecha no puede ser futura" },
    ),

  education_level: educationLevelSchema.optional(),
});

export const changePasswordSchema = z.object({
  current_password: z
    .string({
      required_error: "La contraseña actual es obligatoria",
    })
    .min(1, "La contraseña actual es obligatoria"),

  new_password: z
    .string({
      required_error: "La nueva contraseña es obligatoria",
    })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Debe incluir mayúsculas, minúsculas y números",
    ),
});

import { Router } from "express";
import {
  register,
  login,
  logout,
  profile,
  verifyToken,
  updatePersonalInfo,
  changePassword,
  updatePreferences,
  deactivateAccount,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/validateToken.js";
import { validateSchema } from "../middleware/validator.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { Student, User, Tutor, Role } from "../db/models/index.js";

const router = Router();

// ========== Autenticación ==========
router.post("/register", validateSchema(registerSchema), register);
router.post("/login", validateSchema(loginSchema), login);
router.post("/logout", logout);
router.get("/verify", verifyToken);
router.get("/profile", authRequired, profile);

// =========================
// HOME DEL ESTUDIANTE
// =========================
router.get("/home", authRequired, async (req, res) => {
  try {
    // Solo estudiantes
    if (req.user.role_id !== 3) {
      return res.status(403).json({ message: "User is not a student" });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: {
        association: "progress",
      },
    });

    if (!student || !student.progress) {
      return res.status(404).json({ message: "Student progress not found" });
    }

    // 👉 Devolvemos SOLO el progreso
    return res.json({
      breathing_done: student.progress.breathing_done,
      breathing_total: student.progress.breathing_total,

      diary_done: student.progress.diary_done,
      diary_total: student.progress.diary_total,

      meditation_done: student.progress.meditation_done,
      meditation_total: student.progress.meditation_total,

      streak_days: student.progress.streak_days,
      sessions_completed: student.progress.sessions_completed,
      total_progress: student.progress.total_progress,
    });
  } catch (error) {
    console.error("❌ Error Home:", error);
    res.status(500).json({ message: "Error loading home data" });
  }
});

// ========== Obtener perfiles ==========
// Extraemos los datos del estudiante con tutores
router.get("/student", authRequired, async (req, res) => {
  try {
    console.log("🔍 Buscando estudiante para user_id:", req.user.id);
    console.log("Role ID del usuario:", req.user.role_id);

    // Verificar que el usuario sea estudiante (role_id = 3)
    if (req.user.role_id !== 3) {
      console.log("❌ Usuario no es estudiante, role_id:", req.user.role_id);
      return res.status(403).json({ 
        message: "User is not a student",
        role_id: req.user.role_id 
      });
    }
    
    const student = await Student.findOne({
      where: { user_id: req.user.id },
      attributes: [
        "id_student",
        "user_id",
        "first_name",
        "last_name",
        "birth_day",
        "is_adult",
        "education_level"
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'is_active'],
          required: false
        },
        {
          model: Tutor,
          as: 'tutors',
          attributes: ['id_tutor', 'full_name', 'phone', 'relationship', 'email_tutor'],
          through: { 
            attributes: ['is_primary']
          },
          required: false
        }
      ]
    });

    if (!student) {
      console.log("❌ No se encontró registro de estudiante para user_id:", req.user.id);
      return res.status(404).json({ 
        message: "Student profile not found"
      });
    }

    console.log("✅ Estudiante encontrado:", student.toJSON());

    // Formatear la respuesta
    const response = {
      id_student: student.id_student,
      user_id: student.user_id,
      first_name: student.first_name,
      last_name: student.last_name,
      full_name: `${student.first_name} ${student.last_name}`,
      birth_day: student.birth_day,
      is_adult: student.is_adult,
      education_level: student.education_level,
      email: student.user?.email || null,
      is_active: student.user?.is_active || true,
      tutors: student.tutors?.map(tutor => ({
        id: tutor.id_tutor,
        full_name: tutor.full_name,
        phone: tutor.phone,
        relationship: tutor.relationship,
        email_tutor: tutor.email_tutor,
        is_primary: tutor.StudentTutor?.is_primary || false
      })) || []
    };

    console.log("✅ Respuesta formateada:", response);

    res.json(response);
  } catch (error) {
    console.error("❌ Error completo:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message,
      details: error.toString()
    });
  }
});

// RUTA ADMIN con manejo de errores mejorado
router.get("/admin", authRequired, async (req, res) => {
  try {
    console.log("🔍 Buscando admin para user_id:", req.user.id);
    console.log("Role ID del usuario:", req.user.role_id);
    
    const admin = await User.findOne({
      where: { id: req.user.id },
      attributes: ["id", "email", "role_id", "is_active", "created_at"],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    if (!admin) {
      console.log("❌ No se encontró usuario con id:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Usuario encontrado:", admin.toJSON());

    // Verificar si es admin (role_id = 1)
    if (admin.role_id !== 1) {
      console.log("❌ Usuario no es admin, role_id:", admin.role_id);
      return res.status(403).json({ message: "User is not an admin" });
    }

    // Formatear la respuesta del admin
    const response = {
      user_id: admin.id,
      email: admin.email,
      role_id: admin.role_id,
      role_name: admin.role?.name || 'Administrador',
      is_active: admin.is_active,
      created_at: admin.created_at,
      display_name: admin.email.split('@')[0]
    };

    console.log("✅ Respuesta formateada:", response);

    res.json(response);
  } catch (error) {
    console.error("❌ Error al obtener perfil de admin:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Endpoint para obtener el email de un usuario específico
router.get("/user/:id", authRequired, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["email", "is_active"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      email: user.email,
      is_active: user.is_active
    });
  } catch (error) {
    console.error("Error al obtener email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ========== Settings - Actualizar información ==========

// Actualizar información personal
router.put("/user/update-personal", authRequired, updatePersonalInfo);

// Cambiar contraseña
router.put("/user/change-password", authRequired, changePassword);

// Actualizar preferencias
router.put("/user/preferences", authRequired, updatePreferences);

// Desactivar cuenta
router.put("/user/deactivate", authRequired, deactivateAccount);


export default router;
import bcrypt from "bcryptjs";
import {
  User,
  Role,
  Student,
  Tutor,
  StudentTutor,
} from "../db/models/index.js";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config/config.js";
import sequelize from "../db/connection.js"; // para transacción
import { calculateAge } from "../utils/age.js";
import { registerSchema, loginSchema, updatePersonalInfoSchema } from "../schemas/auth.schema.js"; // importa tu Zod schema
import { StudentProgress } from "../db/models/index.js"; //importa el Progreso del estudiante

export const register = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    /* =========================
       1. Validación con Zod
    ========================= */
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      // extraemos todos los mensajes de error
      await transaction.rollback();
      const errors = parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json(errors);
    }

    // si pasa la validación
    const {
      email,
      password,
      first_name,
      last_name,
      birth_day,
      education_level,
      full_name_tutor,
      phone_tutor,
      relationship,
      psychological_issue,
      email_tutor,
    } = parsed.data;

    /* =========================
       2. Comprobaciones previas
    ========================= */
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json(["Email ya registrado"]);
    }

    const existingStudent = await Student.findOne({
      where: { first_name, last_name },
    });
    if (existingStudent) {
      await transaction.rollback();
      return res.status(409).json(["Estudiante ya registrado"]);
    }

    const studentRole = await Role.findOne({ where: { name: "student" } });

    /* =========================
       3. Hash contraseña
    ========================= */
    const passwordHash = await bcrypt.hash(password, 10);

    /* =========================
       4. Crear usuario
    ========================= */
    const userSaved = await User.create(
      {
        email,
        password_hash: passwordHash,
        role_id: studentRole.id,
        is_active: true,
      },
      { transaction },
    );

    /* =========================
       5. Calcular edad
    ========================= */
    const age = calculateAge(birth_day);
    const isAdult = age >= 18;

    /* =========================
       6. Crear estudiante
    ========================= */
    let psychologicalIssueHash = null;

    if (psychological_issue)
      psychologicalIssueHash = await bcrypt.hash(psychological_issue, 10);

    const studentSaved = await Student.create(
      {
        user_id: userSaved.id,
        first_name,
        last_name,
        birth_day,
        is_adult: isAdult,
        education_level,
        psychological_issue_hash: psychologicalIssueHash,
      },
      { transaction },
    );

    /* =========================
     6.1 Crear progreso del estudiante
  ========================= */
    await StudentProgress.create(
      {
        student_id: studentSaved.id_student,
      },
      { transaction },
    );

    /* =========================
       7. Crear tutor si menor
    ========================= */
    if (!isAdult) {
      const existingTutor = await Tutor.findOne({
        where: { full_name: full_name_tutor },
      });
      if (existingTutor) {
        await transaction.rollback();
        return res.status(409).json(["Tutor ya registrado"]);
      }

      const tutorSaved = await Tutor.create(
        {
          full_name: full_name_tutor,
          email_tutor,
          phone: phone_tutor,
          relationship,
        },
        { transaction },
      );

      await StudentTutor.create(
        {
          student_id: studentSaved.id_student,
          tutor_id: tutorSaved.id_tutor,
          is_primary: true,
        },
        { transaction },
      );
    }

    /* =========================
       8. Confirmar transacción
    ========================= */
    await transaction.commit();

    /* =========================
       9. Generar token
    ========================= */
    const token = await createAccessToken({
      id: userSaved.id,
      role_id: userSaved.role_id,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user_id: userSaved.id,
      user: {
        id: userSaved.id,
        email: userSaved.email,
        role_id: userSaved.role_id,
        role_name: studentRole.name,
        first_name: first_name,
        last_name: last_name,
      },
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error(error);
    return res.status(500).json(["Error interno del servidor"]);
  }
};

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json(errors);
    }

    const { email, password } = parsed.data;

    const userFound = await User.findOne({
      where: { email },
      include: [
        { model: Role, as: "role" },
        { model: Student, as: "student" },
      ],
    });
    if (!userFound || !userFound.is_active)
      return res.status(401).json(["Email is not valid"]);

    const passwordValid = await bcrypt.compare(
      password,
      userFound.password_hash,
    );
    if (!passwordValid) return res.status(401).json(["Invalid password"]);

    const token = await createAccessToken({
      id: userFound.id,
      role_id: userFound.role_id,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: userFound.id,
        email: userFound.email,
        role_id: userFound.role_id,
        role_name: userFound.role.name,
        first_name: userFound.student?.first_name || null,
        last_name: userFound.student?.last_name || null,
      },
    });
  } catch (error) {
    return res.status(500).json(["Internal server error"]);
  }
};

export const logout = async (req, res) => {
  try {
    // ✅ Eliminar la cookie estableciendo una fecha de expiración pasada
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "lax",
      secure: false,
    });

    return res.json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(["Internal server error"]);
  }
};

//Se a actualizado para que se muestre el nombre del usuario en el home

export const profile = async (req, res) => {
  try {
    const userFound = await User.findByPk(req.user.id, {
      include: [{ model: Student, as: "student" }], // incluir Student
    });

    if (!userFound) return res.status(404).json(["User not found"]);

    const role = await Role.findByPk(userFound.role_id);

    return res.json({
      id: userFound.id,
      email: userFound.email,
      role_id: userFound.role_id,
      role_name: role?.name || null,
      first_name: userFound.student?.first_name || null, // aquí ya estará disponible
      last_name: userFound.student?.last_name || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json(["Internal server error"]);
  }
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json(["No token provided"]);

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json(["Invalid token"]);

    const userFound = await User.findByPk(user.id, {
      include: [
        { model: Role, as: "role" },
        { model: Student, as: "student" },
      ],
    });

    if (!userFound) return res.status(404).json(["User not found"]);

    return res.json({
      id: userFound.id,
      email: userFound.email,
      role_id: userFound.role_id,
      role_name: userFound.role.name || null,
      first_name: userFound.student?.first_name || null,
      last_name: userFound.student?.last_name || null,
    });
  });
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const parsed = updatePersonalInfoSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json(errors);
    }

    const { first_name, last_name, email, birth_day, education_level } =
      parsed.data;
    const userId = req.user.id;

    // Actualizar usuario (email)
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(["Usuario no encontrado"]);
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json(["Email already in use"]);
      }
      user.email = email;
    }

    await user.save();

    // Actualizar estudiante (si es estudiante)
    if (req.user.role_id === 3) {
      const student = await Student.findOne({ where: { user_id: userId } });
      if (student) {
        if (first_name) student.first_name = first_name;
        if (last_name) student.last_name = last_name;
        if (birth_day) student.birth_day = birth_day;
        if (education_level) student.education_level = education_level;

        await student.save();
      }
    }

    return res.json({
      message: "Personal information updated successfully",
      user: {
        id: user.id,
        email: user.email,
        first_name: first_name || null,
        last_name: last_name || null,
      },
    });
  } catch (error) {
    console.error("Error updating personal info:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!current_password || !new_password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    // Obtener usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(
      current_password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash nueva contraseña
    const newPasswordHash = await bcrypt.hash(new_password, 10);
    user.password_hash = newPasswordHash;
    await user.save();

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { notifications_email, notifications_push, language, theme } =
      req.body;
    const userId = req.user.id;

    // TODO: Guardar preferencias en una tabla separada o en el modelo User
    // Por ahora, solo devolvemos éxito
    // Puedes crear un modelo UserPreferences si quieres persistir esto

    return res.json({
      message: "Preferences updated successfully",
      preferences: {
        notifications_email,
        notifications_push,
        language,
        theme,
      },
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Marcar como inactivo
    user.is_active = false;
    await user.save();

    // Limpiar cookie de sesión
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "lax",
      secure: false,
    });

    return res.json({
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

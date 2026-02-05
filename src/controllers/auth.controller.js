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
import { registerSchema, loginSchema } from "../schemas/auth.schema.js"; // importa tu Zod schema

export const register = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    /* =========================
       1. Validación con Zod
    ========================= */
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      // extraemos todos los mensajes de error
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
      full_name,
      phone,
      relationship,
      psychological_issue,
    } = parsed.data;

    /* =========================
       2. Comprobaciones previas
    ========================= */
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json(["Email ya registrado"]);

    const existingStudent = await Student.findOne({
      where: { first_name, last_name },
    });
    if (existingStudent)
      return res.status(409).json(["Estudiante ya registrado"]);

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
    const studentSaved = await Student.create(
      {
        user_id: userSaved.id,
        first_name,
        last_name,
        birth_day,
        is_adult: isAdult,
        education_level,
      },
      { transaction },
    );

    /* =========================
       7. Crear tutor si menor
    ========================= */
    if (!isAdult) {
      const existingTutor = await Tutor.findOne({ where: { full_name } });
      if (existingTutor) return res.status(409).json(["Tutor ya registrado"]);

      const tutorSaved = await Tutor.create(
        { full_name, phone, relationship },
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
      user_id: userSaved.id,
    });
  } catch (error) {
    await transaction.rollback();
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

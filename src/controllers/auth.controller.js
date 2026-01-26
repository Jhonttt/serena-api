import bcrypt from "bcryptjs";
import { User, Role } from "../db/models/index.js";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config/config.js";
import { id } from "zod/locales";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json(['Email and password are required']);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json(['Email already registered']);

    const studentRole = await Role.findOne({ where: { name: 'student' } });
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password_hash: passwordHash,
      role_id: studentRole.id,
      is_active: true,
    });

    const userSaved = await user.save();
    const token = await createAccessToken({ id: userSaved.id });

    res.cookie("token", token);
    return res.status(201).json({
      message: 'User registered successfully',
      user_id: userSaved.id,
    });
  } catch (error) {
    return res.status(500).json(['Internal server error']);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json(['Email and password are required']);

    const userFound = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });
    if (!userFound || !userFound.is_active) return res.status(401).json(['Email is not valid']);

    const passwordValid = await bcrypt.compare(password, userFound.password_hash);
    if (!passwordValid) return res.status(401).json(['Invalid password']);

    const token = await createAccessToken({ id: userFound.id });

    res.cookie("token", token);
    return res.json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    return res.status(500).json(['Internal server error']);
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
    })

    // res.clearCookie('accessToken', {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    // });

    return res.json(['Logout successful']);
  } catch (error) {
    return res.status(500).json(['Internal server error']);
  }
};

export const profile = async (req, res) => {
  const userFound = await User.findByPk(req.user.id);
  if (!userFound) return res.status(404).json(['User not found']);

  const role = await Role.findByPk(userFound.role_id);
  return res.json({ id: userFound.id, email: userFound.email, role: role.name });
}

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json(['No token provided']);

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json(['Invalid token']);

    const userFound = await User.findByPk(user.id);
    if (!userFound) return res.status(404).json(['User not found']);

    return res.json({
      id: userFound.id,
      email: userFound.email
    })
  });
}
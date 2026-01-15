const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { createAccessToken, createRefreshToken } = require('../utils/jwt');

// -------------------------
// REGISTER
// -------------------------
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Verificar si existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Rol por defecto: student
    const studentRole = await Role.findOne({ where: { name: 'student' } });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash: passwordHash,
      role_id: studentRole.id,
      is_active: true,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user_id: user.id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// -------------------------
// LOGIN
// -------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Crear tokens
    const accessToken = createAccessToken({ userId: user.id });
    const refreshToken = createRefreshToken({ userId: user.id });

    // Guardar refresh token en cookie segura
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // en local = false
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return res.json({
      message: 'Login successful',
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// -------------------------
// REFRESH TOKEN
// -------------------------
exports.refreshToken = (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const accessToken = createAccessToken({ userId: payload.userId });

    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // <-- AÑADIR ESTO
const authRoutes = require('./routes/authRoutes');
const authenticate = require('./middleware/authMiddleware');
const authorizeRole = require('./middleware/authorizeRole');

const app = express();

// CORS CONFIG (OBLIGATORIO PARA LOGIN DESDE REACT)
app.use(cors({
  origin: 'http://localhost:5173', // frontend
  credentials: true,               // permitir cookies
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ruta protegida con JWT
app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'Access granted', userId: req.userId });
});

app.get(
  '/admin',
  authenticate,
  authorizeRole(['admin']),
  (req, res) => {
    res.json({ message: 'Admin area' });
  }
);

module.exports = app;

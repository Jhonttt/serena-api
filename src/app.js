const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const authenticate = require('./middleware/authMiddleware'); // <-- IMPORTANTE

const app = express();

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

module.exports = app;

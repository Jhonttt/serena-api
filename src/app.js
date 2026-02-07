import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import { PORT } from "./config/config.js";
import authRoutes from "./routes/auth.routes.js";
import resourceRoutes from "./routes/resources.routes.js";
import { authenticate } from "./middleware/authMiddleware.js";
import { authorizeRole } from "./middleware/authorizeRole.js";

const app = express();

// CORS CONFIG (OBLIGATORIO PARA LOGIN DESDE REACT)
app.use(cors({
  origin: 'http://localhost:5173', // frontend
  // origin: 'https://app.proyectoserena.org', // frontend
  credentials: true,               // permitir cookies
}));

app.set("port", PORT);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api/resources',resourceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ruta protegida con JWT
app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'Access granted', id: req.id });
});

app.get(
  '/admin',
  authenticate,
  authorizeRole(['admin']), (req, res) => {
    res.json({ message: 'Admin area' });
  }
);

export default app;
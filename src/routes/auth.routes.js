import { Router } from 'express';
import { register, login, logout, profile, verifyToken } from '../controllers/auth.controller.js';
import { authRequired } from '../middleware/validateToken.js';
import { validateSchema } from '../middleware/validator.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import Student from "../db/models/student.model.js";

const router = Router();

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', logout);

router.get("/verify", verifyToken);
router.get('/profile', authRequired, profile);

//Extraemos los datos del usuario
router.get("/student", authRequired, async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { user_id: req.user.id },
      attributes: ["first_name", "last_name"],
    });

    if (!student) {
      return res.status(404).json(["Student not found"]);
    }

    res.json(student);
  } catch (error) {
    res.status(500).json(["Internal server error"]);
  }
});


export default router;
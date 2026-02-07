import bcrypt from 'bcryptjs';
import sequelize from '../db/connection.js';
import { Role, User, Student, StudentProgress } from '../db/models/index.js';

const runSeed = async () => {
  try {
    await sequelize.authenticate();

    // 1. Crear roles (si no existen)
    const roles = ['admin', 'psychologist', 'student'];
    for (const roleName of roles) {
      await Role.findOrCreate({
        where: { name: roleName },
      });
    }

    // 2. Obtener rol admin
    const adminRole = await Role.findOne({ where: { name: 'admin' } });

    // 3. Hash de contraseña
    const plainPassword = 'Admin1234!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // 4. Crear usuario admin (si no existe)
    await User.findOrCreate({
      where: { email: 'admin@serena.test' },
      defaults: {
        password_hash: passwordHash,
        role_id: adminRole.id,
        is_active: true,
      },
    });

    // 5. Crear usuario student
    const studentRole = await Role.findOne({ where: { name: 'student' } });
    const studentPasswordHash = await bcrypt.hash('Student1234!', 10);

    const [studentUser, created] = await User.findOrCreate({
      where: { email: 'student@serena.test' },
      defaults: {
        password_hash: studentPasswordHash,
        role_id: studentRole.id,
        is_active: true,
      },
    });

    // 6. Crear estudiante vinculado
    const [studentSaved, studentCreated] = await Student.findOrCreate({
      where: { user_id: studentUser.id },
      defaults: {
        first_name: 'Juan',
        last_name: 'Pérez',
        birth_day: new Date('2002-05-15'),
        is_adult: true,
        education_level: 'Universitario',
      },
    });

    // 7. Crear progreso inicial "realista" para Juan
    await StudentProgress.findOrCreate({
      where: { student_id: studentSaved.id_student },
      defaults: {
        breathing_done: 9,
        breathing_total: 10,
        diary_done: 14,
        diary_total: 20,
        meditation_done: 17,
        meditation_total: 20,
        streak_days: 5,
        sessions_completed: 12,
        total_progress: 82, // porcentaje aproximado
      },
    });

    console.log('✅ Seed completed successfully with realistic progress for Juan');
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
};

export default runSeed;

import bcrypt from 'bcryptjs';
import sequelize from '../db/connection.js';
import { Role, User, Student } from '../db/models/index.js';


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
    
    //5. Crear usuario student o actualizar si ya existe
    const studentRole = await Role.findOne({ where: { name: 'student' } });
    
    const passwordHash2 = 'Student1234!';
    const studentPasswordHash = await bcrypt.hash(passwordHash2, 10);

    const [studentUser, created] = await User.findOrCreate({
      where: { email: 'student@serena.test' },
      defaults: {
        password_hash: studentPasswordHash,
        role_id: studentRole.id,
        is_active: true,
      },
    });
    
    //Crear estudiante vinculado si no existe
    await Student.findOrCreate({
      where: { user_id: studentUser.id },
      defaults: {
        first_name: 'Juan',
        last_name: 'Pérez',
        birth_day: new Date('2002-05-15'),
        is_adult: true,
        education_level: 'Universitario',
      },
    });

    console.log('Seed completed successfully');
    // process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    // process.exit(1);
  }
}

export default runSeed;

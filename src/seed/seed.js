require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Role, User } = require('../models');

async function seed() {
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

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

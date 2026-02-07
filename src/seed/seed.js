import bcrypt from 'bcryptjs';
import sequelize from '../db/connection.js';
import { Role, User, Student, Tutor, StudentTutor } from '../db/models/index.js';

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
    
    // 2. Obtener roles
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const studentRole = await Role.findOne({ where: { name: 'student' } });
    
    // 3. Hash de contraseñas
    const adminPasswordHash = await bcrypt.hash('Admin1234!', 10);
    const studentPasswordHash = await bcrypt.hash('Student1234!', 10);
    const minorPasswordHash = await bcrypt.hash('Minor1234!', 10);
    
    // 4. Crear usuario admin (si no existe)
    await User.findOrCreate({
      where: { email: 'admin@serena.test' },
      defaults: {
        password_hash: adminPasswordHash,
        role_id: adminRole.id,
        is_active: true,
      },
    });
    
    // 5. Crear usuario estudiante adulto (si no existe)
    const [studentUser, createdStudent] = await User.findOrCreate({
      where: { email: 'student@serena.test' },
      defaults: {
        password_hash: studentPasswordHash,
        role_id: studentRole.id,
        is_active: true,
      },
    });
    
    // Crear perfil de estudiante adulto vinculado
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
    
    // 6. ✅ Crear usuario estudiante menor de edad con tutor
    const [minorUser, createdMinor] = await User.findOrCreate({
      where: { email: 'minor@serena.test' },
      defaults: {
        password_hash: minorPasswordHash,
        role_id: studentRole.id,
        is_active: true,
      },
    });
    
    // Crear perfil de estudiante menor
    const [minorStudent, createdMinorStudent] = await Student.findOrCreate({
      where: { user_id: minorUser.id },
      defaults: {
        first_name: 'María',
        last_name: 'González',
        birth_day: new Date('2010-08-20'),
        is_adult: false,
        education_level: 'Secundaria',
      },
    });
    
    // ✅ Crear tutor para el estudiante menor
    const [tutor, createdTutor] = await Tutor.findOrCreate({
      where: { email_tutor: 'tutor@serena.test' },
      defaults: {
        full_name: 'Carmen González Rodríguez',
        email_tutor: 'tutor@serena.test',
        phone: '+34 612 345 678',
        relationship: 'Madre',
      },
    });
    
    // ✅ Vincular estudiante con tutor
    await StudentTutor.findOrCreate({
      where: { 
        student_id: minorStudent.id_student,
        tutor_id: tutor.id_tutor
      },
      defaults: {
        is_primary: true,
      },
    });
    
    console.log('✅ Seed completed successfully');
    console.log('📧 Admin: admin@serena.test / Admin1234!');
    console.log('📧 Student (adulto): student@serena.test / Student1234!');
    console.log('📧 Student (menor): minor@serena.test / Minor1234!');
    console.log('👤 Tutor: tutor@serena.test');
    
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
}

export default runSeed;
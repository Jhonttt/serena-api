import bcrypt from 'bcryptjs';
import sequelize from '../db/connection.js';
import { Role, User, Student, StudentProgress,Resource} from '../db/models/index.js';

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

  
  // ========================
  // 6️⃣ Crear recursos iniciales
  // ========================
const resources = [
  {
    title: "Soledad, acoso e Ideación Suicida en adolescentes",
    description: "Soledad no deseada y riesgo de ideación suicida en adolescentes víctimas de acoso, según Cirenia Quintana-Orts",
    url: "https://www.ivoox.com/soledad-acoso-e-ideacion-suicida-adolescentes-audios-mp3_rf_106572234_1.html",
    type_resource: "Audio",
  },
  {
    title: "El cerebro, nuestro mejor aliado contra el estrés",
    description: "Comprender es aliviar, y cuando comprendes por lo que pasa tu mente, te sientes aliviado; porque si no, eres esclavo de síntomas físicos, psicológicos y vas como perdido por la vida",
    url: "https://www.youtube.com/watch?v=0noAwrWY78U",
    type_resource: "Video",
  },
  {
    title: "Cuatro pilares para una buena autoestima",
    description: "‘A mi yo adolescente’ es un espacio en el que escucharemos la voz de los jóvenes y referentes destacados conversarán sobre autoestima",
    url: "https://www.youtube.com/watch?v=mT8qVzEhiEA",
    type_resource: "Video",
  },
  {
    title: "Cómo combatir la ansiedad: Guía de técnicas esenciales",
    description: "Guía con técnicas esenciales para manejar la ansiedad",
    url: "https://www.areahumana.es/como-combatir-la-ansiedad/",
    type_resource: "Lectura",
  },
  {
    title: "Guía de auto ayuda: Mejora tu autoestima",
    description: "Documento para fortalecer la autoestima personal",
    url: "https://drive.google.com/file/d/1z3thtCKM80cmNBSLZ52AGJhDwBgZG9tn/view?usp=sharing",
    type_resource: "Lectura",
  },
  {
    title: "Guía de auto ayuda: Cómo hacer frente a las preocupaciones",
    description: "Guía práctica para gestionar preocupaciones",
    url: "https://drive.google.com/file/d/1q5-BD-1bbTh_UMrvE7QJ67ic-_wqSTPt/view?usp=sharing",
    type_resource: "Lectura",
  },
  {
    title: "Guía de auto ayuda: Qué puedo hacer para ayudarme si tengo depresión",
    description: "Consejos prácticos para la autoayuda en depresión",
    url: "https://drive.google.com/file/d/1yKsNcoGTesibXG4Z-Jcr0o5M16Wl3TWq/view?usp=sharing",
    type_resource: "Lectura",
  },
  {
    title: "Gestionar el fracaso | 414",
    description: "Gestionar el fracaso no es solo asumir que algo no salió como esperábamos; es enfrentarnos a la frustración, la vergüenza y a esa voz interna que cuestiona nuestro valor.",
    url: "https://www.ivoox.com/gestionar-fracaso-414-audios-mp3_rf_166708543_1.html",
    type_resource: "Audio",
  },
];


for (const res of resources) {
  const [resource, created] = await Resource.findOrCreate({
    where: { url: res.url }, // busca por URL única
    defaults: res,          // si no existe, crea con estos datos
  });

  //De igual forma asi evitamos el error de duplicados
  if (!created) {
    // Si ya existía, opcional: actualizar título o descripción
    await resource.update({
      title: res.title,
      description: res.description,
      type_resource: res.type_resource,
    });
  }
}

  console.log('✅ Seed completado correctamente');

};

export default runSeed;

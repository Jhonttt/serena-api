import User from './user.model.js';
import Role from './role.model.js';
import Psychologist from './pyschologist.model.js';
import AccessLog from './accessLog.model.js';
import Consent from './consent.model.js';
import HealthBackground from './HealthBackground.model.js';
import StudentTutor from './studentTutor.model.js';
import Student from './student.model.js';
import Tutor from './tutor.model.js';
import Resource from './resources.js';
// -------------------------
// Relaciones
// -------------------------

// Role 1 ── N User
Role.hasMany(User, {
  as: 'users',
  foreignKey: 'role_id',
});

User.belongsTo(Role, {
  as: 'role',
  foreignKey: 'role_id',
});


// User 1 ── 1 Psychologist
User.hasOne(Psychologist, {
  as: 'psychologist',
  foreignKey: 'user_id',
});

Psychologist.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
});

// User 1 ── N AccessLog
User.hasMany(AccessLog, {
  as: 'accessLogs',
  foreignKey: 'user_id',
});

AccessLog.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
});

// Student 1 ── N HealthBackground
Student.hasMany(HealthBackground, {
  as: 'healthBackgrounds',
  foreignKey: 'student_id',
});
HealthBackground.belongsTo(Student, {
  as: 'student',
  foreignKey: 'student_id',
});

// Student N ── M Tutor (StudentTutor)
Student.belongsToMany(Tutor, {
  through: StudentTutor,
  as: 'tutors',
  foreignKey: 'student_id',
});
Tutor.belongsToMany(Student, {
  through: StudentTutor,
  as: 'students',
  foreignKey: 'tutor_id',
});

// Student 1 ── N Consent
Student.hasMany(Consent, {
  as: 'consents',
  foreignKey: 'student_id',
});
Consent.belongsTo(Student, {
  as: 'student',
  foreignKey: 'student_id',
});

// Tutor 1 ── N Consent (opcional, nullable)
Tutor.hasMany(Consent, {
  as: 'consents',
  foreignKey: 'tutor_id',
});
Consent.belongsTo(Tutor, {
  as: 'tutor',
  foreignKey: 'tutor_id',
});

// User 1 ── 1 Student
User.hasOne(Student, {
  as: 'student',
  foreignKey: 'user_id',
});

Student.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
});


// Usuario 1 - N Recursos
User.hasMany(Resource, {
  foreignKey: 'user_id',
  as: 'resources',
});

Resource.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});


export {
  User,
  Role,
  Psychologist,
  AccessLog,
  Consent,
  HealthBackground,
  Student,
  StudentTutor,
  Tutor,
  Resource
};
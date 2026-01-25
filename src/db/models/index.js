import User from './user.model.js';
import Role from './role.model.js';
import Psychologist from './pyschologist.model.js';
import AccessLog from "./accessLog.model.js"

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

export {
  User,
  Role,
  Psychologist,
  AccessLog,
};
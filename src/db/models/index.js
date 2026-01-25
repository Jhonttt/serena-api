import User from './user.model.js';
import Role from './role.model.js';

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


export {
  User,
  Role
};
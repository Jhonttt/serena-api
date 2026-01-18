const sequelize = require('../config/database');

const Role = require('./Role');
const User = require('./User');
const RefreshToken = require('./RefreshToken'); // <-- IMPORTANTE

// -------------------------
// Relaciones
// -------------------------

// Role 1 ── N User
Role.hasMany(User, {
  as: 'users',
  foreignKey: 'role_id',
});

User.belongsTo(Role, {
  as: 'role',            // 👈 NECESARIO
  foreignKey: 'role_id',
});

// User 1 ── N RefreshToken
User.hasMany(RefreshToken, {
  foreignKey: 'user_id',
});

RefreshToken.belongsTo(User, {
  foreignKey: 'user_id',
});

// -------------------------
// Exportar modelos
// -------------------------
module.exports = {
  sequelize,
  Role,
  User,
  RefreshToken, // <-- IMPORTANTE
};
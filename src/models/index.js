const sequelize = require('../config/database');

const Role = require('./Role');
const User = require('./User');

Role.hasMany(User, {
  foreignKey: 'role_id',
});

User.belongsTo(Role, {
  foreignKey: 'role_id',
});

module.exports = {
  sequelize,
  Role,
  User,
};
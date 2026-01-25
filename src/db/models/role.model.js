import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
  }
);

export default Role;
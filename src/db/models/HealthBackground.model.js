import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const HealthBackground = sequelize.define('HealthBackground', {
  id_health: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },

  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  condition_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  declared_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },

}, {
  tableName: 'health_background',
  timestamps: true,
  underscored: true,
});

export default HealthBackground;
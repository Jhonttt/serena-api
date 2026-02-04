import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const Resource = sequelize.define('Resource', {
  id_resource: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  type_resource: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'resources',
  timestamps: true,
  underscored: true,
});

export default Resource;

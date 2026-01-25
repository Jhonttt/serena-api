import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const AccessLog = sequelize.define('AccessLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45), // IPv4 / IPv6
    allowNull: false,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'access_logs',
  timestamps: true,
  underscored: true,
});

export default AccessLog;
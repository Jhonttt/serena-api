import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const Psychologist = sequelize.define('Psychologist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'psychologists',
  timestamps: true,
  underscored: true,
});

export default Psychologist;
import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const Psychologist = sequelize.define('Psychologist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique:true,
  },

  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },

  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  license_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique:true,
  },
  specialization: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'psychologists',
  timestamps: true,
  underscored: true,
});

export default Psychologist;
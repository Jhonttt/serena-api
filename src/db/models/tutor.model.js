import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const Tutor = sequelize.define('Tutor', {
  id_tutor: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },

  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email_tutor: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      }
    },

  phone: {
    type: DataTypes.STRING(12), //por si ponen +34
    allowNull: false,
  },

  relationship: {
    type: DataTypes.STRING(50), 
    allowNull: false,
  },

}, {
  tableName: 'tutor',
  timestamps: true,      
  underscored: true,     
});

export default Tutor;
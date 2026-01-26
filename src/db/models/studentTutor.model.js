// src/models/studentTutor.model.js
import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const StudentTutor = sequelize.define('StudentTutor', {
  id_studentTutor: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },

  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  tutor_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  is_primary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },

}, {
  tableName: 'student_tutor',
  timestamps: true,
  underscored: true,
});

export default StudentTutor;
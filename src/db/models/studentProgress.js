import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const StudentProgress = sequelize.define('StudentProgress', {
  // 🫁 Respiración
  breathing_done: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  breathing_total: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },

  // 📔 Diario
  diary_done: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  diary_total: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },

  // 🧘 Meditación
  meditation_done: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  meditation_total: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },

  // 🔥 Racha
  streak_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // ✅ Sesiones completadas
  sessions_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // 📊 Progreso total (0–100)
  total_progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

export default StudentProgress;

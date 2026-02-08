// models/UserPreferences.js
import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const UserPreferences = sequelize.define("UserPreferences", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  notifications_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notifications_push: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: "es",
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: "light",
  },
});

export default UserPreferences;
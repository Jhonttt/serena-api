import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const Student = sequelize.define('Student', {
    id_student: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
    },

    firt_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },

    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },

    birth_day: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    is_adult: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

    education_level: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    tableName: 'student',
    timestamps: true,
    underscored: true,
}

);
export default Student;
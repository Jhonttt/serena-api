import sequelize from '../connection.js';
import { DataTypes } from 'sequelize';

const Consent =sequelize.define('Consent', {
id_consent:{
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique:true,
    primaryKey:true,
    allowNull:false,
},

consent_type:{
    type:DataTypes.STRING(50),
    allowNull:false,
},

  signed_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

} ,{
tableName:'consent',
underscored:true,
timestamps:true,
});

export default Consent;
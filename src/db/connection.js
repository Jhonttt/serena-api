import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_DIALECT } from "../config/config.js";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    logging: false
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate({ logging: false });
    console.log(">>> MySQL connection");
  } catch (error) {
    console.log(error);
  }
}

export const syncDB = async () => {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ logging: false, force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(">>> Models synced");
  } catch (error) {
    console.log(error);
  }
}

export default sequelize;
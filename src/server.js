require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK');

    await sequelize.sync({ alter: true });
    console.log('Models synchronized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();

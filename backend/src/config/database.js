const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function setupDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database models synchronized successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  setupDatabase
}; 
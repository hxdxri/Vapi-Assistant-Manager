require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { setupRoutes } = require('./routes');
const { setupDatabase } = require('./config/database');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

// Initialize database and start server
async function startServer() {
  try {
    await setupDatabase();
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 
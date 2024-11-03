// backend-project/config.js

const dotenvSafe = require('dotenv-safe');
const path = require('path');

// Load environment variables and ensure they are set
dotenvSafe.config({
  path: path.resolve(__dirname, '.env'),
  example: path.resolve(__dirname, '.env.example'),
});

const config = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery-app',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  SALT_ROUNDS: process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 12,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'],
};

// Logging for non-production environments
if (config.NODE_ENV !== 'production') {
  console.info(`config.js - Loaded MONGO_URI: ${config.MONGO_URI}`);
  console.info(`config.js - Loaded REDIS_URL: ${config.REDIS_URL}`);
  console.info(`config.js - Loaded FRONTEND_URL: ${config.FRONTEND_URL}`);
  console.info(`config.js - Loaded PORT: ${config.PORT}`);
  console.info(`config.js - Loaded NODE_ENV: ${config.NODE_ENV}`);
  console.info('config.js - Sensitive keys (JWT_SECRET, GOOGLE_MAPS_API_KEY) have been loaded.');
}

module.exports = config;

const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    try {
      await connectDB();
    } catch (dbError) {
      console.warn('Warning: database connection failed. Starting server with fallback mode.');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

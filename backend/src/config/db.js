const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', false);

  const maxRetries = 5;
  const retryDelayMs = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority',
      });

      console.log(`✓ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        console.error('✗ MongoDB Connection Error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠ MongoDB disconnected - attempting to reconnect...');
      });

      return conn;
    } catch (error) {
      console.error(`✗ MongoDB connection error (attempt ${attempt}/${maxRetries}): ${error.message}`);

      if (attempt === maxRetries) {
        console.warn('\n⚠ DATABASE CONNECTION ISSUE:');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        if (error.message.includes('ECONNREFUSED')) {
          console.warn('Local MongoDB is not running. Make sure MongoDB is started.');
        } else if (error.message.includes('connect ENOTFOUND')) {
          console.warn('Cannot reach MongoDB server. Check your MONGODB_URI.');
        } else if (error.message.includes('whitelisted')) {
          console.warn('Your IP address is not whitelisted in MongoDB Atlas.');
          console.warn('1. Go to MongoDB Atlas: https://cloud.mongodb.com');
          console.warn('2. Navigate to Network Access (Security > Network Access)');
          console.warn('3. Click "Add IP Address"');
          console.warn('4. Add your current IP or allow 0.0.0.0/0 (all IPs)');
          console.warn('5. Restart this server');
        } else {
          console.warn('Connection details: ' + error.message);
        }
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

module.exports = connectDB;

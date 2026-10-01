import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      autoIndex: true,
    });
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    // Do not crash server in dev so app can still boot for testing if DB is offline
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

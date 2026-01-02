import mongoose from 'mongoose';
import configEnv from './config.js';

const connectToDb = async () => {
  try {
    await mongoose.connect(configEnv.dbUrl);
    console.log('[INFO] Connected to DB');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[ERROR] Error while connecting to db:', error.message);
    } else {
      console.error('[ERROR] Error while connecting to db:', error);
    }
  }
};

export default connectToDb;

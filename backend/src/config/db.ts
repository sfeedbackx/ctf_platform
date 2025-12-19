import mongoose from 'mongoose';
import config from './config.js';

const connectToDb = async () => {
  try {
    await mongoose.connect(config.dbUrl);
    console.log('Connected to DB');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('error while connecting to db', error.message); // Safe to access message property
    } else {
      console.log('error while connecting to db', error);
    }
  }
};

export default connectToDb;

import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  dbUrl: string;
  secret: string;
  maxAge: number;
}

const paserNumber = (numberString: string | undefined): number | undefined => {
  try {
    return Number(numberString);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log('error while parsing number');
  }
};
const config: Config = {
  port: paserNumber(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DB_URL || '',
  secret: process.env.SECRET || 'secret_key',
  maxAge: paserNumber(process.env.MAX_AGE) || 604800000,
};

export default config;

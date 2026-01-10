import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  dbUrl: string;
  secret: string;
  maxAge: number;
  serverHost: string;
  dockerHost: string;
  ssrfFlag: string;
}

export const paserNumber = (
  numberString: string | undefined,
): number | undefined => {
  try {
    return Number(numberString);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('[ERROR] Error while parsing number');
  }
};
const configEnv: Config = {
  port: paserNumber(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DB_URL || '',
  secret: process.env.SECRET || 'secret_key',
  maxAge: paserNumber(process.env.MAX_AGE) || 604800000,
  serverHost: process.env.SERVER_HOST || 'localhost',
  dockerHost: process.env.DOCKER_HOST || '',
  ssrfFlag: process.env.SSRF_FLAG || 'flag',
};

export default configEnv;

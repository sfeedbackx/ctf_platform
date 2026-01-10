import dotenv from 'dotenv';
dotenv.config();
export const paserNumber = (numberString) => {
    try {
        return Number(numberString);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (error) {
        console.error('[ERROR] Error while parsing number');
    }
};
const configEnv = {
    port: paserNumber(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    dbUrl: process.env.DB_URL || '',
    secret: process.env.SECRET || 'secret_key',
    maxAge: paserNumber(process.env.MAX_AGE) || 604800000,
    serverHost: process.env.SERVER_HOST || 'localhost',
    dockerHost: process.env.DOCKER_HOST || '',
};
export default configEnv;
//# sourceMappingURL=config.js.map
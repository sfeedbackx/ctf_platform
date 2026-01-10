import jwt from 'jsonwebtoken';
import configEnv from '../config/config.js';
import { Error } from 'mongoose';
/**
 * Generates a JWT token for the given user data.
 *
 * @param {IJwtUser} jwtUser - User data to encode in the token.
 * @returns {string} JWT token string.
 */
export const generateToken = (jwtUser) => {
    return jwt.sign(jwtUser, configEnv.secret, { expiresIn: configEnv.maxAge });
};
/**
 * Validates a JWT token and extracts its payload.
 *
 * @param {string} token - JWT token string to validate.
 * @returns {TokenValidationResult} Validation result with payload if valid, or error if invalid.
 */
export const tokenValidation = (token) => {
    try {
        const decoded = jwt.verify(token, configEnv.secret);
        return {
            valid: true,
            payload: decoded,
        };
    }
    catch (err) {
        return {
            valid: false,
            error: err instanceof Error ? err.message : 'Invalid token',
        };
    }
};
//# sourceMappingURL=jwtUtils.js.map
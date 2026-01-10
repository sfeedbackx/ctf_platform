import type { TokenValidationResult } from '../types/jwtTypes.js';
import type { IJwtUser } from '../types/userTypes.js';
/**
 * Generates a JWT token for the given user data.
 *
 * @param {IJwtUser} jwtUser - User data to encode in the token.
 * @returns {string} JWT token string.
 */
export declare const generateToken: (jwtUser: IJwtUser) => string;
/**
 * Validates a JWT token and extracts its payload.
 *
 * @param {string} token - JWT token string to validate.
 * @returns {TokenValidationResult} Validation result with payload if valid, or error if invalid.
 */
export declare const tokenValidation: (token: string) => TokenValidationResult;
//# sourceMappingURL=jwtUtils.d.ts.map
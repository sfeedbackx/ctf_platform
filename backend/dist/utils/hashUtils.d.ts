/**
 * Hashes a password using bcrypt with a salt round of 15.
 *
 * @param {string} password - Plain text password to hash.
 * @returns {Promise<string>} Hashed password.
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Compares a plain text password with a hashed password.
 *
 * @param {string} password - Plain text password to compare.
 * @param {string} hash - Hashed password to compare against.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
export declare const checkPassword: (password: string, hash: string) => Promise<boolean>;
//# sourceMappingURL=hashUtils.d.ts.map
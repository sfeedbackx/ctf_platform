import bcrypt from 'bcryptjs';
/**
 * Hashes a password using bcrypt with a salt round of 15.
 *
 * @param {string} password - Plain text password to hash.
 * @returns {Promise<string>} Hashed password.
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(15);
    return bcrypt.hash(password, salt);
};
/**
 * Compares a plain text password with a hashed password.
 *
 * @param {string} password - Plain text password to compare.
 * @param {string} hash - Hashed password to compare against.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
export const checkPassword = (password, hash) => {
    return bcrypt.compare(password, hash);
};
//# sourceMappingURL=hashUtils.js.map
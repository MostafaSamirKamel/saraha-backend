const argon2 = require('argon2');
const crypto = require('crypto');

/**
 * Hybrid Hashing Strategy:
 * 1. SHA-256: Pre-hash the password to ensure deterministic length and additional entropy.
 * 2. Argon2id: Final salted hash (Memory-hard, resistant to GPU attacks).
 */

const hashPassword = async (password) => {
    try {
        const peppered = crypto.createHash('sha256').update(password).digest('hex');
        return await argon2.hash(peppered, { type: argon2.argon2id });
    } catch (error) {
        throw new Error('Hashing failed');
    }
};

const comparePassword = async (password, storedHash) => {
    try {
        const peppered = crypto.createHash('sha256').update(password).digest('hex');
        return await argon2.verify(storedHash, peppered);
    } catch (error) {
        return false;
    }
};

module.exports = {
    hashPassword,
    comparePassword
};

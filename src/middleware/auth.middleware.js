const { verifyToken } = require('../utils/token.util');
const userRepository = require('../repositories/user.repository');
const { isTokenBlacklisted } = require('../utils/redis.util');

const authMiddleware = async (req, res, next) => {
    console.log(`[Auth] TRACING: ${req.method} ${req.url}`);
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn('[Auth] No token provided');
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];

        /*
        // Check Redis blacklist
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            return res.status(401).json({ error: 'Unauthorized: Token has been revoked' });
        }
        */

        const decoded = verifyToken(token, process.env.JWT_SECRET);
        if (!decoded) {
            console.warn('[Auth] Token decode failed');
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        }
        console.log('[Auth] Decoded User ID:', decoded.id);

        const user = await userRepository.findById(decoded.id);
        if (!user) {
            console.warn('[Auth] User not found in DB');
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        console.log('[Auth] Authenticated:', user.email);

        req.user = user;
        next();
    } catch (error) {
        console.error('[Auth] CRITICAL ERROR:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = authMiddleware;

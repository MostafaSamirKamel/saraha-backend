const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        connectTimeout: 500 // 500ms timeout
    }
});

client.on('error', (err) => {
    // console.log('Redis Client Error', err.message);
});

let lastFailed = 0;
const COOLDOWN = 10000; // 10s cooldown

// Connect to redis
const connectRedis = async () => {
    const now = Date.now();
    if (now - lastFailed < COOLDOWN) return false;

    try {
        if (!client.isOpen) {
            await client.connect();
            console.log('Connected to Redis successfully');
        }
        return true;
    } catch (err) {
        lastFailed = Date.now();
        // console.error('Redis connection failed, continuing without Redis:', err.message);
        return false;
    }
};

const blacklistToken = async (token, expirySeconds) => {
    const isConnected = await connectRedis();
    if (!isConnected) return;
    
    try {
        await client.set(`blacklist:${token}`, 'true', {
            EX: Math.max(1, Math.floor(expirySeconds))
        });
    } catch (err) {
        console.error('Failed to blacklist token:', err.message);
    }
};

const isTokenBlacklisted = async (token) => {
    const isConnected = await connectRedis();
    if (!isConnected) return false;
    
    try {
        const result = await client.get(`blacklist:${token}`);
        return result === 'true';
    } catch (err) {
        console.error('Failed to check blacklist:', err.message);
        return false;
    }
};

module.exports = {
    client,
    connectRedis,
    blacklistToken,
    isTokenBlacklisted
};

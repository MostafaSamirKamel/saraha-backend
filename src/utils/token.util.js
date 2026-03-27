const jwt = require('jsonwebtoken');

const generateToken = (payload, secret, expiry) => {
    return jwt.sign(payload, secret, { expiresIn: expiry });
};

const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};

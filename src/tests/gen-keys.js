const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
}

const privateKeyPath = path.join(keysDir, 'private.key');
const publicKeyPath = path.join(keysDir, 'public.key');

console.log('Generating RSA keys...');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

fs.writeFileSync(privateKeyPath, privateKey);
fs.writeFileSync(publicKeyPath, publicKey);
console.log('RSA keys generated successfully in /keys directory.');

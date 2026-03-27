const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, '../../keys/private.key');
const publicKeyPath = path.join(__dirname, '../../keys/public.key');

/**
 * Message Encryption Strategy:
 * 1. Generate a random AES key for each message.
 * 2. Encrypt the message body with AES-256-GCM.
 * 3. Encrypt the AES key with the receiver's RSA Public Key (or system key for now).
 * 4. Store the encrypted body and the wrapped key.
 */

const encryptMessage = (plaintext) => {
    // 1. Generate AES key and IV
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    // 2. Encrypt with AES-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // 3. Wrap AES key with RSA Public Key
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    const encryptedKey = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        aesKey
    ).toString('hex');

    // Combine metadata for storage
    return {
        body: encrypted,
        metadata: {
            iv: iv.toString('hex'),
            authTag,
            encryptedKey
        }
    };
};

const decryptMessage = (encryptedBody, metadata) => {
    try {
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        // 1. Unwrap AES key with RSA Private Key
        const aesKey = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(metadata.encryptedKey, 'hex')
        );

        // 2. Decrypt body with AES-GCM
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            aesKey,
            Buffer.from(metadata.iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(metadata.authTag, 'hex'));

        let decrypted = decipher.update(encryptedBody, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return '[Encrypted Message]';
    }
};

module.exports = {
    encryptMessage,
    decryptMessage
};

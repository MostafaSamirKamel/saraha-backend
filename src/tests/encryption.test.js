const { encryptMessage, decryptMessage } = require('../utils/encryption.util');

describe('Encryption Utility Verification', () => {
    test('Should encrypt and decrypt a message correctly', () => {
        const plaintext = 'Hello, this is a secret anonymous message!';
        const encryptedResult = encryptMessage(plaintext);

        expect(encryptedResult).toHaveProperty('body');
        expect(encryptedResult).toHaveProperty('metadata');
        expect(encryptedResult.metadata).toHaveProperty('iv');
        expect(encryptedResult.metadata).toHaveProperty('authTag');
        expect(encryptedResult.metadata).toHaveProperty('encryptedKey');

        const decryptedText = decryptMessage(encryptedResult.body, encryptedResult.metadata);
        expect(decryptedText).toBe(plaintext);
    });

    test('Should fail decryption with wrong auth tag', () => {
        const plaintext = 'Sensitive data';
        const encryptedResult = encryptMessage(plaintext);
        
        const tamperedMetadata = { ...encryptedResult.metadata, authTag: '00'.repeat(16) };
        const decryptedText = decryptMessage(encryptedResult.body, tamperedMetadata);
        
        expect(decryptedText).toBe('[Encrypted Message]');
    });
});

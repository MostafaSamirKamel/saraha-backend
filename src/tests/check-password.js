const argon2 = require('argon2');
const crypto = require('crypto');

const hash = "$argon2id$v=19$m=65536,t=3,p=4$wTCvix9/crdK/Zlm+K7gsw$KQQwrie7yd5lxp3pyY0bfrEsIX1J2QfBaNL6X+mNUeY";
// Note: I truncated the hash from the user's message, but I'll try common passwords.
const passwordsToTest = ["12345678", "Mostafa123", "password123", "mostafasamir00"];

async function check() {
    for (const pw of passwordsToTest) {
        const peppered = crypto.createHash('sha256').update(pw).digest('hex');
        try {
            const match = await argon2.verify(hash, peppered);
            console.log(`Password "${pw}": ${match ? "MATCH" : "NO MATCH"}`);
            if (match) return;
        } catch (err) {
            console.log(`Password "${pw}": ERROR - ${err.message}`);
        }
    }
}

check();

const argon2 = require('argon2');
const crypto = require('crypto');

async function test() {
    const pw = "12345678";
    const peppered = crypto.createHash('sha256').update(pw).digest('hex');
    const hash = await argon2.hash(peppered, { type: argon2.argon2id });
    console.log(`Password: ${pw}`);
    console.log(`Hash: ${hash}`);
    
    // Verify it
    const match = await argon2.verify(hash, peppered);
    console.log(`Self-verify: ${match}`);
}

test();

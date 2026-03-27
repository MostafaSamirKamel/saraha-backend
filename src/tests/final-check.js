const argon2 = require('argon2');
const crypto = require('crypto');

async function test() {
    const hash = "$argon2id$v=19$m=65536,t=3,p=4$7wyKPxc/KanaiEFTLUpo/A$4xl//HuGJN0WSfRa1q+cEMGX1O+tmSp5jFnmXmNbkRQ";
    const pw = "mm123456&";
    
    // Test WITH pepper
    const peppered = crypto.createHash('sha256').update(pw).digest('hex');
    const matchWithPepper = await argon2.verify(hash, peppered);
    console.log(`Password "${pw}" WITH pepper match: ${matchWithPepper}`);
    
    // Test WITHOUT pepper
    const matchWithoutPepper = await argon2.verify(hash, pw);
    console.log(`Password "${pw}" WITHOUT pepper match: ${matchWithoutPepper}`);
}

test();

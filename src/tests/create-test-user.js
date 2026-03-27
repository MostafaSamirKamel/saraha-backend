const mongoose = require('mongoose');
const { hashPassword } = require('../utils/hash.util');
require('dotenv').config();

async function createTestUser() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('../modules/user/user.model');
    
    const email = 'test@example.com';
    const existing = await User.findOne({ email });
    if (existing) {
        console.log('User already exists');
        process.exit(0);
    }

    const hashedPassword = await hashPassword('Password123');
    await User.create({
        firstName: 'Test',
        lastName: 'User',
        email,
        password: hashedPassword,
        isConfirmed: true
    });
    
    console.log('✅ Test user created: test@example.com / Password123');
    process.exit(0);
}

createTestUser();

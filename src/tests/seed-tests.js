const mongoose = require('mongoose');
const { hashPassword } = require('./src/utils/hash.util');
require('dotenv').config();

async function seedTestUsers() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./src/modules/user/user.model');
    
    const users = [
        { email: 'test_a@example.com', password: 'Password123!', username: 'user_a', firstName: 'User', lastName: 'Alpha' },
        { email: 'test_b@example.com', password: 'Password123!', username: 'user_b', firstName: 'User', lastName: 'Beta' }
    ];

    for (const u of users) {
        const existing = await User.findOne({ email: u.email });
        if (existing) {
            console.log(`User ${u.email} already exists`);
            continue;
        }

        const hashedPassword = await hashPassword(u.password);
        await User.create({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            username: u.username,
            password: hashedPassword,
            isConfirmed: true
        });
        console.log(`✅ Test user created: ${u.email}`);
    }
    
    process.exit(0);
}

seedTestUsers().catch(err => {
    console.error(err);
    process.exit(1);
});

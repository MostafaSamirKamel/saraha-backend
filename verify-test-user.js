const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function verifyUser(email) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            isConfirmed: Boolean,
            OTP: Object
        }));

        const result = await User.updateOne(
            { email: email },
            { $set: { isConfirmed: true, 'OTP.code': null } }
        );

        if (result.matchedCount > 0) {
            console.log(`User ${email} verified successfully!`);
        } else {
            console.log(`User ${email} not found.`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const emailToVerify = process.argv[2] || 'finaluser1000@gmail.com';
verifyUser(emailToVerify);

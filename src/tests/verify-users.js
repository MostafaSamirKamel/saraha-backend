const mongoose = require('mongoose');
const User = require('./src/modules/user/user.model');

async function verifyAllUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/saraha');
        console.log('Connected to MongoDB');
        
        const result = await User.updateMany({}, { $set: { isVerified: true } });
        console.log('Updated users:', result);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

verifyAllUsers();

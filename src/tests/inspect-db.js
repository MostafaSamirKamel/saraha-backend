const mongoose = require('mongoose');
require('dotenv').config();

async function inspect() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('../modules/user/user.model');
    const user = await User.findOne({ email: 'mostafasameer858@gmail.com' });
    console.log('User in DB:', JSON.stringify(user, null, 2));
    process.exit(0);
}

inspect();

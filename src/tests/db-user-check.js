const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../modules/user/user.model');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: "mostafasameer858@gmail.com" });
    if (user) {
        console.log('User Found:');
        console.log(JSON.stringify(user, null, 2));
    } else {
        console.log('User Not Found');
    }
    await mongoose.disconnect();
}

check();

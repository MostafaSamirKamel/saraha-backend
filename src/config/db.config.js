const mongoose = require('mongoose');
const chalk = require('chalk');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(chalk.green('✓ MongoDB Connected Successfully'));
    } catch (error) {
        console.error(chalk.red('✗ MongoDB Connection Failed:', error.message));
        process.exit(1);
    }
};

module.exports = connectDB;

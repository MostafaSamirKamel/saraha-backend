const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:3006/api';

async function runTest() {
    try {
        console.log('--- Starting Full Flow Test ---');

        // 1. Cleanup
        await mongoose.connect(process.env.MONGO_URI);
        await mongoose.connection.collection('users').deleteMany({ email: 'testuser@example.com' });
        console.log('✓ Cleaned up test user');

        // 2. Signup
        const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
            firstName: 'Test',
            lastName: 'User',
            username: 'testuserfull',
            email: 'testuser@example.com',
            password: 'password123'
        });
        console.log('✓ Signup Success');

        // 3. Get OTP from DB (Simulating reading email)
        const User = require('./src/modules/user/user.model');
        const user = await User.findOne({ email: 'testuser@example.com' });
        const otpCode = user.OTP.code;
        console.log(`✓ Retrieved OTP: ${otpCode}`);

        // 4. Verify OTP
        await axios.post(`${BASE_URL}/auth/verify`, {
            email: 'testuser@example.com',
            code: otpCode
        });
        console.log('✓ OTP Verified');

        // 5. Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            loginIdentifier: 'testuser@example.com',
            password: 'password123'
        });
        const { accessToken } = loginRes.data;
        console.log('✓ Login Success');

        // 6. Test Profile
        const profileRes = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✓ Profile retrieved for:', profileRes.data.user.email);

        console.log('--- Full Flow Test Completed Successfully! ---');
        process.exit(0);
    } catch (error) {
        console.error('✗ Test Failed:');
        console.error(error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();

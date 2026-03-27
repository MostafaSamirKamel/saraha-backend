const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../modules/user/user.model');
const redis = require('redis');
const connectDB = require('../config/db.config');

let redisClient;

jest.setTimeout(30000);

beforeAll(async () => {
    await connectDB();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('User Authentication Integration Flow', () => {
    let otpCode;
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
    };

    test('Step 1: Signup', async () => {
        console.log('--- Step 1 START ---');
        // Clear existing test user
        await User.deleteOne({ email: testUser.email });

        const response = await request(app)
            .post('/api/auth/signup')
            .send(testUser);

        console.log('Signup Status:', response.status);
        if (response.status !== 201) console.log('Signup Error Payload:', response.body);
        expect(response.status).toBe(201);
        expect(response.body.message).toContain('registered successfully');
        
        // Retrieve OTP from DB for testing
        const user = await User.findOne({ email: testUser.email });
        otpCode = user.OTP.code;
        expect(otpCode).toBeDefined();
    });

    test('Step 2: Verify OTP', async () => {
        const response = await request(app)
            .post('/api/auth/verify')
            .send({
                email: testUser.email,
                code: otpCode
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('verified successfully');

        const user = await User.findOne({ email: testUser.email });
        expect(user.isConfirmed).toBe(true);
    });

    test('Step 3: Login', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                loginIdentifier: testUser.email,
                password: testUser.password
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body.user.email).toBe(testUser.email);
    });

    test('Step 4: Login should fail with wrong password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                loginIdentifier: testUser.email,
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
    });
});

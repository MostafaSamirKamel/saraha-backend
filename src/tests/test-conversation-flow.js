const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api';

async function runConversationTest() {
    try {
        console.log('--- Starting Conversation Flow Test ---');
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Setup Users
        const User = require('./src/modules/user/user.model');
        const userA = await User.findOne({ email: 'sender@test.com' });
        const userB = await User.findOne({ email: 'testuser@example.com' });

        // Login as User A (Sender) to send a message
        const loginResA = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'sender@test.com',
            password: 'password123'
        });
        const tokenA = loginResA.data.accessToken;

        // Login as User B (Receiver) to reply
        const loginResB = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        const tokenB = loginResB.data.accessToken;

        // 2. User A sends message to User B (Authenticated)
        const sendRes = await axios.post(`${BASE_URL}/messages`, {
            receiverID: userB._id,
            body: 'Hello User B! This is an initial message.'
        }, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        const messageId = sendRes.data.messageId;
        console.log(`✓ Message sent from A to B: ${messageId}`);

        // 3. User B replies to that message
        const replyRes = await axios.post(`${BASE_URL}/conversations/reply`, {
            messageId: messageId,
            body: 'Thinking... and here is my reply!'
        }, {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        console.log('✓ User B replied successfully');
        const conversationId = replyRes.data.reply.conversationID;

        // 4. Verification: check conversation
        const threadRes = await axios.get(`${BASE_URL}/conversations`, {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        console.log(`✓ User B has ${threadRes.data.conversations.length} conversations`);

        console.log('--- Conversation Flow Test Completed Successfully! ---');
        process.exit(0);
    } catch (error) {
        console.error('✗ Test Failed:');
        console.error(error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runConversationTest();

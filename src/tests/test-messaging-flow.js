const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api';

async function runMessagingTest() {
    try {
        console.log('--- Starting Messaging Flow Test ---');
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Get a receiver (the test user we created earlier)
        const User = require('./src/modules/user/user.model');
        const receiver = await User.findOne({ email: 'testuser@example.com' });
        if (!receiver) {
            console.error('Test user not found. Please run test-full-flow.js first.');
            process.exit(1);
        }
        const receiverId = receiver._id;

        // 2. Login as receiver to get token for inbox access
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        const { accessToken } = loginRes.data;

        // 3. Send Anonymous Message
        const messageBody = 'This is a secret message! 🔐';
        const sendRes = await axios.post(`${BASE_URL}/messages`, {
            receiverID: receiverId,
            body: messageBody
        });
        console.log('✓ Anonymous Message Sent');

        // 4. Retrieve Inbox
        const inboxRes = await axios.get(`${BASE_URL}/messages/inbox`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const messages = inboxRes.data.messages;
        console.log(`✓ Retrieved ${messages.length} messages from inbox`);
        messages.forEach((m, i) => console.log(`  Message ${i}: ${m.body}`));

        // 5. Verify Content Decryption
        const lastMessage = messages.find(m => m.body === messageBody);
        if (lastMessage) {
            console.log('✓ Message content verified and decrypted correctly:', lastMessage.body);
        } else {
            console.error('✗ Could not find the test message in inbox!');
            process.exit(1);
        }

        console.log('--- Messaging Flow Test Completed Successfully! ---');
        process.exit(0);
    } catch (error) {
        console.error('✗ Test Failed:');
        console.error(error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runMessagingTest();

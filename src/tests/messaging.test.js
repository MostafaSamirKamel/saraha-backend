const request = require('supertest');
const app = require('../app');
const User = require('../modules/user/user.model');
const Message = require('../modules/message/message.model');
const connectDB = require('../config/db.config');
const redis = require('redis');

describe('Messaging & Conversation Integration Flow', () => {
    let senderToken, receiverToken, receiverId, messageId;

    beforeAll(async () => {
        await connectDB();
        // Setup redis clients/etc if needed
        const senderInfo = { firstName: 'Sender', lastName: 'User', username: 'senderuser', email: 'sender@test.com', password: 'password123' };
        const receiverInfo = { firstName: 'Receiver', lastName: 'User', username: 'receiveruser', email: 'receiver@test.com', password: 'password123' };

        await User.deleteMany({ email: { $in: [senderInfo.email, receiverInfo.email] } });

        // Signup and Verify Sender
        await request(app).post('/api/auth/signup').send(senderInfo);
        const sender = await User.findOneAndUpdate({ email: senderInfo.email }, { isConfirmed: true }, { new: true });
        const senderLogin = await request(app).post('/api/auth/login').send({ loginIdentifier: senderInfo.email, password: senderInfo.password });
        senderToken = senderLogin.body.accessToken;

        // Signup and Verify Receiver
        await request(app).post('/api/auth/signup').send(receiverInfo);
        const receiver = await User.findOneAndUpdate({ email: receiverInfo.email }, { isConfirmed: true }, { new: true });
        receiverId = receiver._id;
        const receiverLogin = await request(app).post('/api/auth/login').send({ loginIdentifier: receiverInfo.email, password: receiverInfo.password });
        receiverToken = receiverLogin.body.accessToken;
    });

    test('Step 1: Send Anonymous Message', async () => {
        const response = await request(app)
            .post('/api/messages')
            .send({
                receiverID: receiverId,
                body: 'Hello! I am an anonymous sender.'
            });

        expect(response.status).toBe(201);
        messageId = response.body.messageId;
        expect(messageId).toBeDefined();
    });

    test('Step 2: Receiver views Inbox', async () => {
        const response = await request(app)
            .get('/api/messages/inbox')
            .set('Authorization', `Bearer ${receiverToken}`);

        expect(response.status).toBe(200);
        expect(response.body.messages.length).toBeGreaterThan(0);
        expect(response.body.messages[0].body).toBeDefined(); // Body is encrypted in DB, but controller returns it
    });

    test('Step 3: Sender sends as Authenticated but message is still anonymous by default', async () => {
        const response = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${senderToken}`)
            .send({
                receiverID: receiverId,
                body: 'Hello from authenticated sender!'
            });

        expect(response.status).toBe(201);
        const msgInDb = await Message.findById(response.body.messageId);
        expect(msgInDb.senderID).toBeDefined(); // Should be recorded if token provided
    });
});

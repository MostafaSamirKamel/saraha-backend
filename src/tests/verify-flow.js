const axios = require('axios');
require('dotenv').config({ path: './.env' });

const API_URL = 'http://localhost:3006/api';

async function testFlow() {
    try {
        console.log('--- Starting Verification Flow ---');

        // 1. Setup: Create/Login two users
        // Assuming we have these users from previous tests or creating them
        // For simplicity, I'll use placeholders here, but in a real test I'd hit signup/login
        
        // Let's assume userA and userB are already in the DB
        // I'll try to login with common test credentials or use existing ones if I can find them
        const userA = { email: 'test_a@example.com', password: 'Password123!', username: 'user_a' };
        const userB = { email: 'test_b@example.com', password: 'Password123!', username: 'user_b' };

        console.log('1. Logging in User A...');
        let loginA;
        try {
            loginA = await axios.post(`${API_URL}/auth/login`, { loginIdentifier: userA.email, password: userA.password });
        } catch (e) {
            console.log('User A login failed, trying signup...');
            await axios.post(`${API_URL}/auth/signup`, { ...userA, fullName: 'User A' });
            // Since there's OTP, this is tricky in a script. 
            // I'll skip the automated "new user" creation if it's too complex and assume existing users for now.
            // Or I'll use a script that manually marks confirmed in DB.
            console.log('Please ensure test_a@example.com and test_b@example.com exist and are verified.');
            return;
        }
        const tokenA = loginA.data.accessToken;
        const idA = loginA.data.user.id;

        console.log('2. Logging in User B...');
        const loginB = await axios.post(`${API_URL}/auth/login`, { loginIdentifier: userB.email, password: userB.password });
        const tokenB = loginB.data.accessToken;
        const idB = loginB.data.user.id;

        console.log('3. User A searches for User B...');
        const searchRes = await axios.get(`${API_URL}/auth/search?q=user_b`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log('Search Result:', searchRes.data.users.length > 0 ? 'Success' : 'Failed');

        console.log('4. User A sends an anonymous message to User B...');
        const msgRes = await axios.post(`${API_URL}/messages`, {
            receiverID: idB,
            body: 'Hello User B, this is an anonymous message from User A (who is logged in).'
        }, { headers: { Authorization: `Bearer ${tokenA}` } });
        const rootMsgId = msgRes.data.messageId;
        console.log('Message Sent ID:', rootMsgId);

        console.log('5. User B checks inbox...');
        const inboxRes = await axios.get(`${API_URL}/messages/inbox`, { headers: { Authorization: `Bearer ${tokenB}` } });
        const receivedMsg = inboxRes.data.messages.find(m => m._id === rootMsgId);
        console.log('Received Message found in Inbox:', !!receivedMsg);
        console.log('Sender info visible to Receiver?:', receivedMsg.senderID ? (receivedMsg.senderID.username || 'ID present') : 'Anonymous (Correct)');

        console.log('6. User B replies to User A...');
        const replyRes = await axios.post(`${API_URL}/conversations/reply`, {
            messageId: rootMsgId,
            body: 'Hello Anonymous, I am replying to you!'
        }, { headers: { Authorization: `Bearer ${tokenB}` } });
        const conversationId = replyRes.data.conversationID;
        console.log('Reply Sent. Conversation ID:', conversationId);

        console.log('7. User A checks conversation history with User B...');
        const convRes = await axios.get(`${API_URL}/conversations/with/${idB}`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log('Conversations with User B found:', convRes.data.conversations.length);
        
        console.log('8. User A sends a SECOND independent message to User B...');
        const msgRes2 = await axios.post(`${API_URL}/messages`, {
            receiverID: idB,
            body: 'This is another independent message.'
        }, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log('Second Message Sent ID:', msgRes2.data.messageId);

        console.log('9. User B replies to the second message...');
        const replyRes2 = await axios.post(`${API_URL}/conversations/reply`, {
            messageId: msgRes2.data.messageId,
            body: 'Replying to your second message!'
        }, { headers: { Authorization: `Bearer ${tokenB}` } });
        console.log('Second Conversation ID:', replyRes2.data.conversationID);
        console.log('IDs matched?:', conversationId === replyRes2.data.conversationID ? 'Same (Incorrect - should be independent)' : 'Different (Correct)');

        console.log('--- Verification Flow Complete ---');
    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
    }
}

testFlow();

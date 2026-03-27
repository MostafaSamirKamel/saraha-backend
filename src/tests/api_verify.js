const axios = require('axios');

const API_URL = 'http://localhost:3006/api';

async function verifyFlow() {
  console.log('--- Starting API Verification Flow ---');
  
  try {
    // 1. Login (using the user seen in logs earlier)
    console.log('1. Attempting Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'mostafasameer858@gmail.com',
      password: 'mm1234567' // I saw this in the logs earlier
    });
    
    const token = loginRes.data.accessToken;
    const user = loginRes.data.user;
    console.log('   ✅ Login Successful. User:', user.email);
    
    // 2. Send Message (to self as a test using username)
    console.log('2. Sending Anonymous Message...');
    const msgRes = await axios.post(`${API_URL}/messages`, {
      body: `Verification Test - ${new Date().toISOString()}`,
      receiverID: 'mostafasamir' // Resolved from username
    });
    console.log('   ✅ Message Sent. ID:', msgRes.data.messageId);
    
    // 3. Get Inbox
    console.log('3. Fetching Inbox...');
    const inboxRes = await axios.get(`${API_URL}/messages/inbox`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const messages = inboxRes.data.messages;
    console.log(`   ✅ Inbox Fetched. Total Messages: ${messages.length}`);
    
    const lastMsg = messages[0];
    console.log('   Latest Message Content:', lastMsg.content);
    
    if (lastMsg.content.includes('Verification Test')) {
      console.log('\n--- 🏆 VERIFICATION SUCCESSFUL 🏆 ---');
    } else {
      console.log('\n--- ❌ VERIFICATION FAILED (Message not found) ❌ ---');
    }

  } catch (error) {
    console.error('\n--- ❌ VERIFICATION FAILED (Error) ❌ ---');
    console.error(error.response?.data || error.message);
  }
}

verifyFlow();

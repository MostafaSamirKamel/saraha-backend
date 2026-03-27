const axios = require('axios');

const BASE_URL = 'http://localhost:3005/api/auth';

async function testLogout() {
    console.log('--- Testing Redis Logout ---');
    
    try {
        // 1. Login to get a token
        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'Password123'
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Login successful');

        // 2. Test profile access
        console.log('Accessing profile...');
        const profileRes = await axios.get(`${BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile access successful:', profileRes.data.user.email);

        // 3. Logout
        console.log('Logging out...');
        await axios.post(`${BASE_URL}/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Logout successful');

        // 4. Test profile access again (should fail)
        console.log('Accessing profile again (this should fail)...');
        try {
            await axios.get(`${BASE_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('❌ Error: Token was not invalidated!');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Success: Token is correctly invalidated (401 Unauthorized)');
                console.log('Error Message:', error.response.data.error);
            } else {
                console.error('❌ Unexpected error during second profile access:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.error || error.message);
    }
}

testLogout();

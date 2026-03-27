const axios = require('axios');

async function testSearch() {
    try {
        // 1. Login to get token
        const loginRes = await axios.post('http://localhost:3006/api/auth/login', {
            identifier: 'testuser777',
            password: 'password123' // Assuming this or similar
        }).catch(e => e.response);
        
        console.log('Login Status:', loginRes?.status);
        if (loginRes?.status !== 200) {
            console.log('Login failed, trying to search without token (should fail)');
        }
        
        const token = loginRes?.data?.token;
        
        // 2. Test search
        const searchRes = await axios.get('http://localhost:3006/api/auth/search?q=test', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }).catch(e => e.response);
        
        console.log('Search Status:', searchRes?.status);
        console.log('Search Results:', JSON.stringify(searchRes?.data, null, 2));
        
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testSearch();

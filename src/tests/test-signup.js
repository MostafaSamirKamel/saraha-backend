const axios = require('axios');

async function testSignup() {
    try {
        const response = await axios.post('http://localhost:3006/api/auth/signup', {
            firstName: 'Test',
            lastName: 'User',
            username: 'testsignup',
            email: 'testuser@example.com',
            password: 'password123'
        });
        console.log('Signup success:', response.data);
    } catch (error) {
        console.error('Signup failed:', error.response ? error.response.data : error.message);
    }
}

testSignup();

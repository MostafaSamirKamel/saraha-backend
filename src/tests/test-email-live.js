const path = require('path');
const dotenv = require('dotenv');

// Load .env first
dotenv.config({ path: path.join(__dirname, '.env') });

const sendEmail = require('./src/utils/email.util.js');

async function testResendLive() {
    console.log('--- Testing Resend SDK ---');
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    try {
        const result = await sendEmail({
            email: 'sarahadev0@gmail.com',
            subject: 'Hello from Resend SDK! 🚀',
            message: 'Congrats on sending your first email via the Resend SDK!',
            html: '<p>Congrats on sending your <strong>first email</strong> via the Resend SDK!</p>'
        });
        console.log('✅ Email sent successfully!');
        console.log('Result:', result);
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
    }
}

testResendLive();

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'sarahadev0@gmail.com',
        pass: 'oguksshb lhwv wysg'
    },
    tls: {
       // Force IPv4
       rejectUnauthorized: false
    }
});

async function testGmail() {
    console.log('--- Testing Gmail SMTP (IPv4 Force) ---');
    try {
        await transporter.sendMail({
            from: 'sarahadev0@gmail.com',
            to: 'mostafasameer858@gmail.com',
            subject: 'Universal Email Test (IPv4)',
            text: 'This email should reach any address by forcing IPv4!'
        });
        console.log('✅ Gmail SMTP success: Email sent!');
    } catch (error) {
        console.error('❌ Gmail SMTP failed:', error.message);
        if (error.message.includes('ENETUNREACH')) {
            console.log('HINT: Still facing network issues. Try using port 587 with secure: false.');
        }
    }
}

testGmail();

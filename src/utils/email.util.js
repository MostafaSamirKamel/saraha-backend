const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Debug: Check if env variables are loaded
    console.log('Attempting to send email via:', process.env.EMAIL_USER);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('ERROR: Email credentials missing in environment!');
    }

    // Configure transport for Port 587 (STARTTLS) - More reliable on cloud hosts
    // FINAL ATTEMPT - Port 25 (Legacy SMTP)
    // Sometimes cloud hosts block 465/587 but leave 25 open for local relaying
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 25,
        secure: false, // Port 25 is not SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        family: 4,
        connectionTimeout: 10000 
    });

    try {
        const mailOptions = {
            from: `"Saraha App" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Nodemailer Error:', error);
        throw error;
    }
};

module.exports = sendEmail;

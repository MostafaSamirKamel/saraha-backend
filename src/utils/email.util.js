const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Debug: Check if env variables are loaded
    console.log('Attempting to send email via:', process.env.EMAIL_USER);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('ERROR: Email credentials missing in environment!');
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            // Force IPv4 to avoid ENETUNREACH errors
            rejectUnauthorized: false
        }
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

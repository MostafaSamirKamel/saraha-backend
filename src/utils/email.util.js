const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Debug: Check if env variables are loaded
    console.log('Attempting to send email via:', process.env.EMAIL_USER);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('ERROR: Email credentials missing in environment!');
    }

    // Configure transport for Port 587 (STARTTLS) - More reliable on cloud hosts
    // Use explicit host/port instead of 'service' to ensure Port 587 and IPv4 are forced
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        family: 4, // Force IPv4
        logger: true, // Log internal nodemailer events
        debug: true   // Log SMTP traffic
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

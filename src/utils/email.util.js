const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Debug: Check if env variables are loaded
    console.log('Attempting to send email via:', process.env.EMAIL_USER);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('ERROR: Email credentials missing in environment!');
    }

    // Configure transport for Port 587 (STARTTLS) - More reliable on cloud hosts
    // Final minimalist attempt using a connection string
    // This can sometimes bypass DNS/routing quirks in specific cloud environments
    const transporter = nodemailer.createTransport(`smtps://${encodeURIComponent(process.env.EMAIL_USER)}:${encodeURIComponent(process.env.EMAIL_PASS)}@smtp.gmail.com`);

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

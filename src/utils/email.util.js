const { Resend } = require('resend');

const sendEmail = async (options) => {
    // Debug: Check if env variable is loaded
    if (!process.env.RESEND_API_KEY) {
        console.error('ERROR: RESEND_API_KEY missing in environment!');
        throw new Error('Email service not configured');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        console.log('Attempting to send email via Resend to:', options.email);
        
        const { data, error } = await resend.emails.send({
            from: 'Saraha App <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        });

        if (error) {
            console.error('Resend Error:', error);
            throw error;
        }

        console.log('Email sent successfully via Resend:', data.id);
        return data;
    } catch (error) {
        console.error('Email Dispatch Error:', error);
        throw error;
    }
};

module.exports = sendEmail;

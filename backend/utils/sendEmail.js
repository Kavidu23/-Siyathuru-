const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html = null) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: `"Siyathuru" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw error; // rethrow so controller can catch it
    }
};

module.exports = sendEmail;

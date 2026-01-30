const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html = null) => {
    try {
        const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
        const port = Number(process.env.SMTP_PORT) || 2525;
        const secure = (process.env.SMTP_SECURE === 'true') || false;

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP_USER or SMTP_PASS not set. Mail may fail to send.');
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                // Allow self-signed certificates if explicitly configured
                rejectUnauthorized:
                    process.env.SMTP_REJECT_UNAUTHORIZED === 'true' ? true : false,
            },
        });

        // Verify connection configuration (useful during development)
        try {
            await transporter.verify();
            console.log(`✅ SMTP transporter is ready (host=${host} port=${port})`);
        } catch (verifyErr) {
            console.warn('⚠️ SMTP transporter verification failed:', verifyErr.message);
        }

        const mailOptions = {
            from: process.env.MAIL_FROM || `"Siyathuru" <no-reply@${host}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error && error.message ? error.message : error);
        throw error; // rethrow so controller can catch it
    }
};

module.exports = sendEmail;

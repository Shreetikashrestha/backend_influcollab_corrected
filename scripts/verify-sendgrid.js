const nodemailer = require('nodemailer');

// ------------------------------------------------------------------
// INSTRUCTIONS:
// 1. Replace the values below with your SendGrid details.
// 2. Run this script using: node scripts/verify-sendgrid.js
// ------------------------------------------------------------------

const API_KEY = 'YOUR_SENDGRID_API_KEY_STARTS_WITH_SG'; // e.g., "SG.xhjw..."
const FROM_EMAIL = 'YOUR_VERIFIED_SENDER_EMAIL'; // Must be verified in SendGrid

async function verifySendGrid() {
    console.log('Testing SendGrid Credentials...');

    const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey', // This is ALWAYS 'apikey' for SendGrid
            pass: API_KEY,
        },
    });

    try {
        // 1. Verify connection configuration
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        // 2. Try sending a test email
        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: FROM_EMAIL, // Send to yourself
            subject: 'SendGrid Verification Test',
            text: 'If you receive this, your SendGrid configuration is correct!',
        });

        console.log('✅ Email Sent Successfully!');
        console.log('Message ID:', info.messageId);
        console.log('\n--- SUCCESS ---');
        console.log('You can now update your .env file with:');
        console.log(`SMTP_HOST=smtp.sendgrid.net`);
        console.log(`SMTP_PORT=587`);
        console.log(`SMTP_USER=apikey`);
        console.log(`SMTP_PASS=${API_KEY}`);
        console.log(`SMTP_FROM=${FROM_EMAIL}`);

    } catch (error) {
        console.error('\n❌ Verification Failed:');
        if (error.response) {
            console.error('Error Response:', error.response);
        } else {
            console.error(error.message);
        }

        if (error.code === 'EAUTH') {
            console.log('\n👉 Tip: Check if your API Key is correct.');
        } else if (error.response && error.response.includes('Sender')) {
            console.log('\n👉 Tip: The "From" email must be a Verified Sender in your SendGrid dashboard.');
        }
    }
}

verifySendGrid();

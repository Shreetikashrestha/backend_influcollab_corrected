const nodemailer = require('nodemailer');

async function createTestAccount() {
    try {
        console.log('Generating Ethereal test account...');
        let testAccount = await nodemailer.createTestAccount();

        console.log('\n--- Ethereal Credentials ---');
        console.log(`SMTP_USER=${testAccount.user}`);
        console.log(`SMTP_PASS=${testAccount.pass}`);
        console.log('----------------------------\n');
        console.log('Copy these values into your re-webapibackend/.env file.');
        console.log('You can view sent emails at: ' + nodemailer.getTestMessageUrl({ messageId: 'dummy' }).split('/messages/')[0]);
    } catch (error) {
        console.error('Failed to create test account:', error.message);
    }
}

createTestAccount();

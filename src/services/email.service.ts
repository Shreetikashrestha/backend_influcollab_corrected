import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from '../config/index';

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });
    }

    async sendPasswordResetEmail(email: string, resetUrl: string) {
        const fromAddress = SMTP_FROM || '"Re-Web Admin" <noreply@reweb.com>';
        const mailOptions = {
            from: fromAddress,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333 text-align: center;">Password Reset Request</h2>
                    <p>You requested a password reset. Please click the button below to reset your password. This link will expire in 1 hour.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">Re-Web App Team</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('Preview URL: %s', previewUrl);
            return { info, previewUrl };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send reset email');
        }
    }
}

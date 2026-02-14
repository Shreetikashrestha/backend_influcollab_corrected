import dotenv from 'dotenv';
dotenv.config();

export const PORT: number =
    process.env.PORT ? parseInt(process.env.PORT) : 5050;
export const MONGODB_URI: string =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/redomobile_backend';
export const JWT_SECRET: string =
    process.env.JWT_SECRET || 'default_secret';
export const SMTP_HOST: string = process.env.SMTP_HOST || 'smtp.ethereal.email';
export const SMTP_PORT: number = parseInt(process.env.SMTP_PORT || '587');
export const SMTP_USER: string = process.env.SMTP_USER || '';
export const SMTP_PASS: string = process.env.SMTP_PASS || '';
export const SMTP_FROM: string = process.env.SMTP_FROM || '';
export const FRONTEND_URL: string = process.env.FRONTEND_URL || 'http://localhost:3000';

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Brevo SMTP transport — creds come from .env (gitignored) / Cloud Run env vars
export const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: (process.env.SMTP_PORT || '587') === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

export async function sendMail(opts: {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}): Promise<{ accepted: (string | { address: string })[]; messageId: string }> {
  const info = await mailTransport.sendMail({
    from: {
      name: process.env.MAIL_FROM_NAME || 'Casagrand Audit System',
      address: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@casagrand.co.in'
    },
    to: opts.to,
    cc: opts.cc,
    subject: opts.subject,
    html: opts.html
  });
  return { accepted: info.accepted, messageId: info.messageId };
}
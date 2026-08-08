import nodemailer from 'nodemailer';
import { getMailConfig } from './storeSettings.service.js';
import { ApiError } from '../utils/apiError.js';

let cachedTransporter = null;
let cacheSignature = '';

async function buildTransporter() {
  const config = await getMailConfig();
  if (!config.enabled) {
    return { transporter: null, config };
  }

  const signature = `${config.host}|${config.port}|${config.user}|${config.pass}|${config.secure}`;
  if (cachedTransporter && cacheSignature === signature) {
    return { transporter: cachedTransporter, config };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  cachedTransporter = transporter;
  cacheSignature = signature;
  return { transporter, config };
}

export function invalidateMailTransporter() {
  cachedTransporter = null;
  cacheSignature = '';
}

async function deliverMail({ to, subject, text, html, replyTo }) {
  const { transporter, config } = await buildTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[dev-mail] ${subject} → ${to}\n${text}`);
      return { delivered: false, devOnly: true };
    }
    throw new ApiError(503, 'Email service is not configured. Please contact support directly.');
  }

  try {
    await transporter.sendMail({
      from: config.from || config.user,
      to,
      replyTo,
      subject,
      text,
      html,
    });
    return { delivered: true, devOnly: false };
  } catch (error) {
    console.error('[mail] send failed:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[dev-mail fallback] ${subject} → ${to}\n${text}`);
      return { delivered: false, devOnly: true, error: error.message };
    }
    throw new ApiError(503, 'Unable to send email right now. Please try again later.');
  }
}

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const subject = 'Reset your NamoPrint password';
  const text = `Hi ${name || 'there'},\n\nUse this link to reset your password:\n${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, ignore this email.`;

  return deliverMail({
    to,
    subject,
    text,
    html: `
      <p>Hi ${name || 'there'},</p>
      <p>Use this link to reset your NamoPrint password:</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>
    `,
  });
};

export const sendContactEmail = async ({ name, email, phone, message }) => {
  const config = await getMailConfig();
  const to = config.contactToEmail || config.user;

  if (!to) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[dev-mail] Contact from ${name} <${email}>: ${message}`);
      return { delivered: false, devOnly: true };
    }
    throw new ApiError(503, 'Contact email is not configured yet.');
  }

  const subject = `New contact message from ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    '',
    'Message:',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  return deliverMail({
    to,
    replyTo: email,
    subject,
    text,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${String(message).replace(/\n/g, '<br/>')}</p>
    `,
  });
};

export const sendTestEmail = async ({ to }) => {
  try {
    const { transporter, config } = await buildTransporter();
    if (!transporter) {
      return { delivered: false, error: 'SMTP is not configured. Add host, username, and password.' };
    }

    await transporter.verify();
    await transporter.sendMail({
      from: config.from || config.user,
      to,
      subject: 'NamoPrint — SMTP test email',
      text: 'Your NamoPrint mailer is working correctly.',
      html: '<p>Your <strong>NamoPrint</strong> mailer is working correctly.</p>',
    });

    return { delivered: true };
  } catch (error) {
    console.error('[mail] test failed:', error.message);
    return { delivered: false, error: error.message };
  }
};

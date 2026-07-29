import nodemailer from 'nodemailer';

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.EMAIL_PORT || '587', 10);
const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

/**
 * Centralized Nodemailer transporter instance configured using SMTP environment variables.
 */
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection configuration during application initialization
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error);
  } else {
    console.log('✅ SMTP Ready');
  }
});

export default transporter;

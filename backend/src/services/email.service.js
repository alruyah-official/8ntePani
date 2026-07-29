import transporter from '../config/mail.js';

/**
 * Reusable email sending service.
 * Supports both object parameter ({ to, subject, html, text }) and positional arguments (to, subject, html, text).
 *
 * @param {object|string} toOrOptions - Recipient email or options object
 * @param {string} [subject] - Email subject line
 * @param {string} [html] - HTML email body content
 * @param {string} [text] - Plain text email body content (optional)
 * @returns {Promise<object>} Nodemailer sendMail output
 */
export const sendEmail = async (toOrOptions, subject, html, text) => {
  try {
    let options = {};

    if (typeof toOrOptions === 'object' && toOrOptions !== null) {
      options = toOrOptions;
    } else {
      options = { to: toOrOptions, subject, html, text };
    }

    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    if (options.text) {
      mailOptions.text = options.text;
    }

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

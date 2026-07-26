import resend from '../config/resend.js';

const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Sends a new order notification email to the freelancer.
 * Fails silently by returning null or error log — never throws.
 *
 * @param {string} freelancerEmail
 * @param {object} data - { freelancerName, clientName, serviceTitle, requirements, price, orderId }
 */
export const sendNewOrderEmail = async (freelancerEmail, data) => {
  try {
    const { freelancerName, clientName, serviceTitle, requirements, price } = data;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">New Order Received — 8ntePani</h2>
        <p>Hello ${freelancerName},</p>
        <p>You have received a new order from <strong>${clientName}</strong>.</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          <p style="margin: 5px 0;"><strong>Price:</strong> ₹${price}</p>
          <p style="margin: 5px 0;"><strong>Requirements:</strong> ${requirements}</p>
        </div>
        <p style="margin: 20px 0;">Login to your dashboard to accept or reject this order.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="font-size: 0.875rem; color: #6B7280;">8ntePani Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: freelancerEmail,
      subject: 'New Order Received — 8ntePani',
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error('Failed to send new order email:', error.message);
    return null;
  }
};

/**
 * Sends order status update email to client or freelancer.
 * Fails silently by returning null or error log — never throws.
 *
 * @param {string} email
 * @param {object} data - { recipientName, status, serviceTitle, orderId }
 */
export const sendOrderStatusEmail = async (email, data) => {
  try {
    const { recipientName, status, serviceTitle } = data;

    const subjects = {
      ACTIVE: 'Your Order Has Been Accepted',
      REJECTED: 'Your Order Was Rejected',
      DELIVERED: 'Your Order Has Been Delivered',
      COMPLETED: 'Order Completed Successfully',
      CANCELLED: 'Order Has Been Cancelled',
    };

    const nextSteps = {
      ACTIVE: 'Your freelancer has accepted and will begin work shortly',
      REJECTED: 'The freelancer has rejected your order. You can hire another freelancer for this service.',
      DELIVERED: 'Please review the delivery and approve completion in your dashboard',
      COMPLETED: 'Thank you for using 8ntePani',
      CANCELLED: 'Your order has been cancelled',
    };

    const subject = subjects[status] || `Order Status Updated: ${status}`;
    const nextStepMessage = nextSteps[status] || 'Check your dashboard for details.';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">${subject}</h2>
        <p>Hello ${recipientName},</p>
        <p><strong>${subject}</strong></p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceTitle}</p>
        </div>
        <p style="margin: 20px 0;">${nextStepMessage}</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="font-size: 0.875rem; color: #6B7280;">8ntePani Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error(`Failed to send order status email for ${status}:`, error.message);
    return null;
  }
};

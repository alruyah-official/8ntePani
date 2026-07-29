import { sendEmail } from "../services/email.service.js";

/**
 * Sends an OTP verification email to the user.
 * Fails silently by returning null — never throws.
 *
 * @param {string} email
 * @param {string} otp
 * @param {string} [name]
 */
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const greeting = `Hello${name ? ", " + name : ""}!`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">Verify your 8ntePani account</h2>
        <p>${greeting}</p>
        <p>Your verification code is:</p>
        <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: 0.5rem; background: #f0f4ff; padding: 1rem 2rem; border-radius: 12px; color: #4338ca; text-align: center; margin: 1.5rem 0;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this code please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="font-size: 0.875rem; color: #6B7280;">8ntePani Team</p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: "Verify your 8ntePani account",
      html: htmlContent,
    });

    return result;
    const info = await sendEmail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    console.log("Email Info:", info);

    return info;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return null;
  }
};

/**
 * Sends a new order notification email to the freelancer.
 * Fails silently by returning null or error log — never throws.
 *
 * @param {string} freelancerEmail
 * @param {object} data - { freelancerName, clientName, serviceTitle, requirements, price, orderId }
 */
export const sendNewOrderEmail = async (freelancerEmail, data) => {
  try {
    const { freelancerName, clientName, serviceTitle, requirements, price } =
      data;

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

    const result = await sendEmail({
      to: freelancerEmail,
      subject: "New Order Received — 8ntePani",
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error("Failed to send new order email:", error);
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
      ACTIVE: "Your Order Has Been Accepted",
      REJECTED: "Your Order Was Rejected",
      DELIVERED: "Your Order Has Been Delivered",
      COMPLETED: "Order Completed Successfully",
      CANCELLED: "Order Has Been Cancelled",
    };

    const nextSteps = {
      ACTIVE: "Your freelancer has accepted and will begin work shortly",
      REJECTED:
        "The freelancer has rejected your order. You can hire another freelancer for this service.",
      DELIVERED:
        "Please review the delivery and approve completion in your dashboard",
      COMPLETED: "Thank you for using 8ntePani",
      CANCELLED: "Your order has been cancelled",
    };

    const subject = subjects[status] || `Order Status Updated: ${status}`;
    const nextStepMessage =
      nextSteps[status] || "Check your dashboard for details.";

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

    const result = await sendEmail({
      to: email,
      subject,
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error(`Failed to send order status email for ${status}:`, error);
    return null;
  }
};

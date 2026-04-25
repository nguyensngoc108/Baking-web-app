import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Nodemailer transporter with environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter connection error:', error.message);
  } else if (success) {
    console.log('Email transporter ready to send messages');
  }
});

const FROM_EMAIL = process.env.EMAIL_USER;

export const sendOrderConfirmation = async (order) => {
  const plainText = `
Order Confirmation

Dear ${order.customerName},

Thank you for your order. Here are the details:

Order ID: ${order._id}
Total Price: $${order.totalPrice}
Delivery Date: ${order.deliveryDate}

We will contact you soon to confirm your order.

Best regards,
Baking Shop Team
  `.trim();

  const msg = {
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: 'Order Confirmation - Baking Shop',
    text: plainText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Order Has Been Received!</h2>
        <p>Dear ${order.customerName},</p>
        <p>Thank you for your order. Here are the details:</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Price:</strong> $${order.totalPrice}</p>
          <p><strong>Delivery Date:</strong> ${order.deliveryDate}</p>
        </div>
        <p>We will contact you soon to confirm your order.</p>
        <p>Best regards,<br><strong>Baking Shop Team</strong></p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(msg);
    console.log('Order confirmation email sent successfully to:', order.customerEmail);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending order confirmation email:', error.message);
    throw error;
  }
};

export const sendOrderNotification = async (adminEmail, order) => {
  const plainText = `
New Order Received

Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
Total Price: $${order.totalPrice}
Delivery Date: ${order.deliveryDate}
Special Requests: ${order.specialRequests || 'None'}
  `.trim();

  const msg = {
    from: FROM_EMAIL,
    to: adminEmail,
    subject: 'New Order Received - Baking Shop',
    text: plainText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Order Received!</h2>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Total Price:</strong> $${order.totalPrice}</p>
          <p><strong>Delivery Date:</strong> ${order.deliveryDate}</p>
          <p><strong>Special Requests:</strong> ${order.specialRequests || 'None'}</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(msg);
    console.log('Order notification email sent to admin:', adminEmail);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending admin notification email:', error.message);
    throw error;
  }
};

export const sendOTPEmail = async (email, otp, userName = 'User') => {
  const plainText = `
Password Reset Request

Hi ${userName},

We received a request to reset your password. Use the OTP below:

Your OTP Code: ${otp}

This OTP expires in 10 minutes.

If you didn't request this, ignore this email.

© Baking Shop Team
  `.trim();

  const msg = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Password Reset OTP - Baking Shop',
    text: plainText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">
          Password Reset Request
        </h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Use the OTP below:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your OTP Code</p>
          <p style="font-size: 32px; font-weight: bold; color: #ff9800; letter-spacing: 3px; margin: 0;">
            ${otp}
          </p>
        </div>
        <p style="color: #666; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© Baking Shop Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(msg);
    console.log('OTP email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    throw error;
  }
};

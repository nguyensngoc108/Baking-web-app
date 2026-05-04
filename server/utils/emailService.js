import { Resend } from 'resend';

let _resend = null;
const getResend = () => {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
};
const FROM = 'S2UGAR <noreply@s2ugar.com>';

const baseStyle = `
  font-family: Arial, Helvetica, sans-serif;
  max-width: 560px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e0d8;
`;

const header = `
  <div style="background: #2c2520; padding: 28px 36px; text-align: center;">
    <h1 style="margin: 0; color: #f5f0e8; font-size: 32px; font-weight: 900; letter-spacing: 8px; font-family: Arial, Helvetica, sans-serif;">S2UGAR</h1>
    <p style="margin: 6px 0 0; color: #b8a898; font-size: 11px; letter-spacing: 2px; font-family: Arial, Helvetica, sans-serif;">ARTISAN BAKERY</p>
  </div>
`;

const footer = `
  <div style="padding: 20px 36px; background: #faf8f5; border-top: 1px solid #e5e0d8; text-align: center;">
    <p style="margin: 0; color: #9c9088; font-size: 12px;">© S2UGAR Artisan Bakery · s2ugar.com</p>
  </div>
`;

const wrap = (body) => `
  <div style="${baseStyle}">
    ${header}
    <div style="padding: 36px;">
      ${body}
    </div>
    ${footer}
  </div>
`;

const send = async ({ to, subject, html, text }) => {
  const { error } = await getResend().emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error('[Resend] Failed to send email to', to, error);
    throw new Error(error.message);
  }
  console.log('[Resend] Email sent to', to, '—', subject);
};

export const sendVerificationOTP = async (email, otp, firstName = 'there') => {
  const html = wrap(`
    <p style="margin: 0 0 6px; color: #6b6460; font-size: 14px;">Hi ${firstName},</p>
    <h2 style="margin: 0 0 20px; color: #2c2520; font-size: 20px;">Verify your email</h2>
    <p style="color: #6b6460; font-size: 14px; line-height: 1.6;">
      Enter the code below to complete your S2UGAR account registration.
      This code expires in <strong>15 minutes</strong>.
    </p>
    <div style="background: #f5f0e8; border-radius: 10px; padding: 28px; text-align: center; margin: 24px 0;">
      <p style="margin: 0 0 6px; color: #9c9088; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Verification Code</p>
      <p style="margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #2c2520; font-family: 'Courier New', Courier, monospace;">${otp}</p>
    </div>
    <p style="color: #9c9088; font-size: 12px; line-height: 1.6;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `);

  await send({
    to: email,
    subject: 'Your S2UGAR verification code',
    html,
    text: `Hi ${firstName}, your S2UGAR verification code is: ${otp}. It expires in 15 minutes.`,
  });
};

export const sendOTPEmail = async (email, otp, userName = 'there') => {
  const firstName = userName.split(' ')[0] || 'there';
  const html = wrap(`
    <p style="margin: 0 0 6px; color: #6b6460; font-size: 14px;">Hi ${firstName},</p>
    <h2 style="margin: 0 0 20px; color: #2c2520; font-size: 20px;">Reset your password</h2>
    <p style="color: #6b6460; font-size: 14px; line-height: 1.6;">
      We received a request to reset your S2UGAR password.
      Use the code below — it expires in <strong>15 minutes</strong>.
    </p>
    <div style="background: #f5f0e8; border-radius: 10px; padding: 28px; text-align: center; margin: 24px 0;">
      <p style="margin: 0 0 6px; color: #9c9088; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Reset Code</p>
      <p style="margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #2c2520; font-family: 'Courier New', Courier, monospace;">${otp}</p>
    </div>
    <p style="color: #9c9088; font-size: 12px; line-height: 1.6;">
      If you didn't request a password reset, ignore this email — your account remains secure.
    </p>
  `);

  await send({
    to: email,
    subject: 'Your S2UGAR password reset code',
    html,
    text: `Hi ${firstName}, your S2UGAR password reset code is: ${otp}. It expires in 15 minutes.`,
  });
};

export const sendOrderConfirmation = async ({ customerName, customerEmail, orderId, totalPrice, deliveryDate, items = [] }) => {
  const shortId = String(orderId).slice(-8).toUpperCase();
  const greeting = customerName ? `Hi ${customerName},` : 'Hi there,';

  const itemsHtml = items.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0 4px;">
      ${items.map(item => `
        <tr>
          <td style="padding: 7px 0; border-bottom: 1px solid #e5e0d8; color: #2c2520; font-size: 13px;">
            ${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ''}
          </td>
          <td style="padding: 7px 0; border-bottom: 1px solid #e5e0d8; color: #2c2520; font-size: 13px; text-align: right;">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `).join('')}
      <tr>
        <td style="padding: 12px 0 0; color: #2c2520; font-size: 14px; font-weight: 700;">Total</td>
        <td style="padding: 12px 0 0; color: #2c2520; font-size: 14px; font-weight: 700; text-align: right;">$${Number(totalPrice).toFixed(2)} NZD</td>
      </tr>
    </table>
  ` : `<p style="margin: 8px 0; color: #2c2520; font-size: 13px;"><strong>Total:</strong> $${Number(totalPrice).toFixed(2)} NZD</p>`;

  const html = wrap(`
    <p style="margin: 0 0 6px; color: #6b6460; font-size: 14px;">${greeting}</p>
    <h2 style="margin: 0 0 20px; color: #2c2520; font-size: 20px;">Your order is confirmed!</h2>
    <p style="color: #6b6460; font-size: 14px; line-height: 1.6;">
      Thank you for ordering from S2UGAR. We've received your order and are getting started on it.
    </p>
    <div style="background: #faf8f5; border: 1px solid #e5e0d8; border-radius: 10px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 4px; color: #9c9088; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Order Reference</p>
      <p style="margin: 0 0 16px; color: #2c2520; font-size: 20px; font-weight: 700; font-family: 'Courier New', Courier, monospace;">#${shortId}</p>
      ${itemsHtml}
      <p style="margin: 16px 0 0; color: #6b6460; font-size: 13px;">
        <strong style="color: #2c2520;">Delivery / Pickup date:</strong> ${deliveryDate}
      </p>
    </div>
    <p style="color: #9c9088; font-size: 12px; line-height: 1.6;">
      We'll be in touch to confirm the details. Questions? Contact us at s2ugar.com.
    </p>
  `);

  await send({
    to: customerEmail,
    subject: `Order confirmed #${shortId} — S2UGAR`,
    html,
    text: `${greeting} Your S2UGAR order #${shortId} is confirmed. Total: $${Number(totalPrice).toFixed(2)} NZD. Delivery: ${deliveryDate}.`,
  });
};

export const sendOrderNotification = async (adminEmail, order) => {
  const html = wrap(`
    <h2 style="margin: 0 0 20px; color: #2c2520; font-size: 20px;">New order received</h2>
    <div style="background: #faf8f5; border: 1px solid #e5e0d8; border-radius: 10px; padding: 20px; margin: 0 0 20px;">
      <p style="margin: 0 0 8px; color: #2c2520; font-size: 13px;"><strong>Customer:</strong> ${order.customerName}</p>
      <p style="margin: 0 0 8px; color: #2c2520; font-size: 13px;"><strong>Email:</strong> ${order.customerEmail}</p>
      <p style="margin: 0 0 8px; color: #2c2520; font-size: 13px;"><strong>Phone:</strong> ${order.customerPhone}</p>
      <p style="margin: 0 0 8px; color: #2c2520; font-size: 13px;"><strong>Total:</strong> $${order.totalPrice}</p>
      <p style="margin: 0 0 8px; color: #2c2520; font-size: 13px;"><strong>Delivery Date:</strong> ${order.deliveryDate}</p>
      <p style="margin: 0; color: #2c2520; font-size: 13px;"><strong>Special Requests:</strong> ${order.specialRequests || 'None'}</p>
    </div>
  `);

  await send({
    to: adminEmail,
    subject: 'New S2UGAR order',
    html,
    text: `New order from ${order.customerName} (${order.customerEmail}). Total: $${order.totalPrice}. Delivery: ${order.deliveryDate}.`,
  });
};

const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOrderNotification(order) {
  const transporter = createTransporter();

  const itemsHtml = JSON.parse(order.items).map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8d8;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8d8;text-align:center;">${item.size}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8d8;text-align:center;">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8d8;text-align:right;">₦${(item.price * item.qty).toLocaleString()}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Glow Scents Orders" <${process.env.SMTP_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `🛍️ New Order #${order.id} — ${order.user_name} — ₦${order.total.toLocaleString()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#faf6f0;font-family:Georgia,serif;">
        <div style="max-width:620px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#1a0a00,#3d1f00);padding:30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;font-size:28px;letter-spacing:3px;">Glow Scents</h1>
            <p style="color:#c9a96e;margin:8px 0 0;font-size:13px;letter-spacing:2px;">NEW ORDER RECEIVED</p>
          </div>

          <!-- Order ID Banner -->
          <div style="background:#d4a843;padding:12px;text-align:center;">
            <p style="margin:0;color:#1a0a00;font-weight:bold;font-size:16px;">Order #${order.id} &nbsp;|&nbsp; ${new Date(order.created_at || Date.now()).toLocaleDateString('en-NG', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>

          <div style="padding:30px;">

            <!-- Customer Info -->
            <h2 style="color:#3d1f00;font-size:16px;border-bottom:2px solid #f0e8d8;padding-bottom:8px;margin-top:0;">👤 Customer Details</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#888;width:130px;">Name</td><td style="padding:6px 0;color:#1a0a00;font-weight:bold;">${order.user_name}</td></tr>
              <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;"><a href="mailto:${order.user_email}" style="color:#d4a843;">${order.user_email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#888;">Phone</td><td style="padding:6px 0;color:#1a0a00;font-weight:bold;font-size:16px;">📞 ${order.user_phone}</td></tr>
            </table>

            <!-- Delivery Address -->
            <h2 style="color:#3d1f00;font-size:16px;border-bottom:2px solid #f0e8d8;padding-bottom:8px;margin-top:24px;">📍 Delivery Address</h2>
            <div style="background:#faf6f0;padding:14px 18px;border-radius:8px;border-left:4px solid #d4a843;">
              <p style="margin:0;color:#1a0a00;line-height:1.7;">
                ${order.delivery_address}<br>
                ${order.delivery_city}${order.delivery_state ? ', ' + order.delivery_state : ''}
              </p>
            </div>

            ${order.notes ? `
            <h2 style="color:#3d1f00;font-size:16px;border-bottom:2px solid #f0e8d8;padding-bottom:8px;margin-top:24px;">📝 Customer Notes</h2>
            <p style="background:#fffdf7;padding:12px;border-radius:6px;color:#555;font-style:italic;">${order.notes}</p>
            ` : ''}

            <!-- Items -->
            <h2 style="color:#3d1f00;font-size:16px;border-bottom:2px solid #f0e8d8;padding-bottom:8px;margin-top:24px;">🧴 Items Ordered</h2>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#faf6f0;">
                  <th style="padding:10px 12px;text-align:left;color:#888;font-size:12px;letter-spacing:1px;">PRODUCT</th>
                  <th style="padding:10px 12px;text-align:center;color:#888;font-size:12px;letter-spacing:1px;">SIZE</th>
                  <th style="padding:10px 12px;text-align:center;color:#888;font-size:12px;letter-spacing:1px;">QTY</th>
                  <th style="padding:10px 12px;text-align:right;color:#888;font-size:12px;letter-spacing:1px;">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <!-- Total -->
            <div style="background:linear-gradient(135deg,#1a0a00,#3d1f00);border-radius:8px;padding:18px 20px;margin-top:16px;display:flex;justify-content:space-between;align-items:center;">
              <span style="color:#c9a96e;font-size:14px;letter-spacing:1px;">TOTAL AMOUNT</span>
              <span style="color:#d4a843;font-size:24px;font-weight:bold;">₦${order.total.toLocaleString()}</span>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:#faf6f0;padding:20px;text-align:center;border-top:1px solid #f0e8d8;">
            <p style="margin:0;color:#888;font-size:12px;">This notification was sent by <strong>Glow Scents</strong> order system</p>
            <p style="margin:6px 0 0;color:#d4a843;font-size:11px;letter-spacing:2px;">PREMIUM OIL PERFUMES & MINIATURES</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

async function sendOrderConfirmation(order, userEmail) {
  const transporter = createTransporter();
  const itemsText = JSON.parse(order.items).map(i => `• ${i.name} (${i.size}) x${i.qty} = ₦${(i.price*i.qty).toLocaleString()}`).join('\n');

  const mailOptions = {
    from: `"Glow Scents" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `✨ Order Confirmed — Glow Scents #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#faf6f0;font-family:Georgia,serif;">
        <div style="max-width:580px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#1a0a00,#3d1f00);padding:30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;font-size:28px;letter-spacing:3px;">Glow Scents</h1>
            <p style="color:#c9a96e;margin:8px 0 0;font-size:13px;letter-spacing:2px;">ORDER CONFIRMED ✨</p>
          </div>
          <div style="padding:30px;">
            <p style="color:#3d1f00;font-size:18px;">Thank you, <strong>${order.user_name}</strong>!</p>
            <p style="color:#555;line-height:1.7;">Your order has been received and we'll prepare it with care. We'll reach you on <strong>${order.user_phone}</strong> before dispatch.</p>
            <div style="background:#faf6f0;padding:16px;border-radius:8px;margin:20px 0;">
              <p style="margin:0 0 8px;color:#888;font-size:12px;letter-spacing:1px;">ORDER #${order.id}</p>
              <p style="margin:0;color:#1a0a00;font-size:20px;font-weight:bold;">₦${order.total.toLocaleString()}</p>
            </div>
            <p style="color:#555;font-size:14px;">Questions? Simply reply to this email.</p>
          </div>
          <div style="background:#faf6f0;padding:16px;text-align:center;border-top:1px solid #f0e8d8;">
            <p style="margin:0;color:#d4a843;font-size:11px;letter-spacing:2px;">PREMIUM OIL PERFUMES & MINIATURES</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOrderNotification, sendOrderConfirmation };

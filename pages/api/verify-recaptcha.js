// pages/api/verify-recaptcha.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const { token, gmail, message } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!token || !secretKey) {
    res.status(400).json({ success: false, error: "Missing token or secret key" });
    return;
  }

  if (!gmail || !message) {
    res.status(400).json({ success: false, error: "Missing gmail or message" });
    return;
  }

  try {
    // 1. Verify reCAPTCHA
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${token}`,
      }
    );
    const data = await response.json();

    if (!data.success) {
      res.status(400).json({ success: false, error: data["error-codes"] });
      return;
    }

    // 2. Send email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Newsletter Message from ${gmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #c9a961; border-bottom: 2px solid #c9a961; padding-bottom: 10px;">
              New Newsletter Message
            </h2>
            <div style="margin: 20px 0;">
              <p style="font-size: 14px; color: #666;">
                <strong style="color: #333;">From:</strong> ${gmail}
              </p>
              <p style="font-size: 14px; color: #666;">
                <strong style="color: #333;">Received:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #c9a961; margin: 20px 0;">
              <p style="font-size: 14px; color: #333; margin: 0;">
                <strong>Message:</strong>
              </p>
              <p style="font-size: 15px; color: #333; margin-top: 10px; line-height: 1.6;">
                ${message}
              </p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                This message was sent from the Amore Hotel website contact form.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 3. Return success (Firebase save happens on client-side in Footer.jsx)
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}
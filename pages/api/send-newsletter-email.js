import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { gmail, message, recaptchaToken } = req.body;
  if (!gmail || !message || !recaptchaToken) return res.status(400).json({ error: "Missing fields" });

  // Verify reCAPTCHA
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
  try {
    const recaptchaRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${recaptchaToken}`,
    });
    const recaptchaJson = await recaptchaRes.json();
    if (!recaptchaJson.success) {
      return res.status(400).json({ error: "reCAPTCHA failed" });
    }
  } catch (e) {
    return res.status(400).json({ error: "reCAPTCHA error" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!adminEmail || !user || !pass) {
    return res.status(500).json({ error: "Email config missing" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Amore Newsletter" <${user}>`,
      to: adminEmail,
      subject: "New Newsletter Message",
      text: `From: ${gmail}\n\n${message}`,
      html: `<p><strong>From:</strong> ${gmail}</p><p>${message}</p>`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
}

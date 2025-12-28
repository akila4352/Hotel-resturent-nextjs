// pages/api/verifyRecaptcha.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const { token } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!token || !secretKey) {
    res.status(400).json({ success: false, error: "Missing token or secret key" });
    return;
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${token}`,
      }
    );
    const data = await response.json();

    if (data.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: data["error-codes"] });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
}
// pages/api/verify-recaptcha.js

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { token } = req.body;
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return res.status(400).json({ success: false, error: "Missing secret or token" });

  try {
    // 1. Verify reCAPTCHA with Google
    const verifyRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      }
    );
    const data = await verifyRes.json();
    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, error: data["error-codes"] || "Verification failed" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Internal error" });
  }
}
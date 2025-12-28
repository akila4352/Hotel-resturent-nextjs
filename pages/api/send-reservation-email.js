import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { to, name, reservation } = req.body;
  if (!to || !reservation) return res.status(400).json({ success: false });

  try {
    // Configure your SMTP transport (use environment variables for credentials)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = "Your Reservation Confirmation";
    const html = `
      <h2>Thank you for your reservation, ${name || "Guest"}!</h2>
      <p>We have received your booking for:</p>
      <ul>
        <li><b>Check-in:</b> ${reservation.checkIn}</li>
        <li><b>Check-out:</b> ${reservation.checkOut}</li>
        <li><b>Guests:</b> ${reservation.adults} adults, ${reservation.children} children</li>
        <li><b>Rooms:</b> ${reservation.selectedRooms.map(r => r.title).join(", ")}</li>
        <li><b>Total Price:</b> $${reservation.totalPrice.toFixed(2)}</li>
      </ul>
      <p>We will contact you soon to confirm your booking.</p>
      <p>Best regards,<br/>Creative Agency</p>
    `;

    await transporter.sendMail({
      from: `"Creative Agency" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
}

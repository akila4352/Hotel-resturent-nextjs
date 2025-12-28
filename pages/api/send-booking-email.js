
import nodemailer from 'nodemailer';
import { formatBookingEmailHtml } from '../../lib/format';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userEmail, userName, bookingDetails } = req.body;

  // Configure transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Set in .env.local
      pass: process.env.GMAIL_PASS, // Set in .env.local
    },
  });

  // Email to user (HTML)
  const userMailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject: 'Booking Confirmation',
    html: formatBookingEmailHtml({
      hotelName: 'Amore Beach Hotel',
      userName,
      userEmail,
      bookingDetails,
    }),
  };

  // Email to admin (HTML)
  const adminMailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL, // Set in .env.local
    subject: 'New Booking Received',
    html: formatBookingEmailHtml({
      hotelName: 'Amore Beach Hotel',
      userName,
      userEmail,
      bookingDetails,
    }),
  };

  try {
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);
    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending emails', error: error.message });
  }
}

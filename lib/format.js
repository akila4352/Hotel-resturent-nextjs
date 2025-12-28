// formatBookingEmailHtml.js
// Returns PREMIUM HTML email body for Gmail

export function formatBookingEmailHtml({
  hotelName = "Your Hotel Name",
  logoUrl = "https://www.amorebeach.com/_next/image?url=%2Fimages%2Flogoo.png&w=640&q=75", // 🔴 replace with real logo URL
  userName,
  userEmail,
  bookingDetails,
}) {
  const roomsHtml = bookingDetails.selectedRooms
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 0;">${r.title}</td>
        <td style="padding:8px 0; text-align:center;">${r.qty}</td>
        <td style="padding:8px 0; text-align:right;">$${r.price}</td>
      </tr>
    `
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Booking Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 10px;">
        
        <!-- MAIN CONTAINER -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- HEADER -->
          <tr>
            <td style="background:#000; padding:20px; text-align:center;">
              <img src="${logoUrl}" alt="${hotelName}" style="max-height:60px; display:block; margin:auto;" />
            </td>
          </tr>


          <!-- TITLE -->
          <tr>
            <td style="padding:25px;">
              <h2 style="margin:0; color:#222;">New Booking Received</h2>
              <p style="margin:8px 0 0; color:#555;">
                Booking from <strong>${userName}</strong> (${userEmail})
              </p>
            </td>
          </tr>

          <!-- THANK YOU MESSAGE FOR GUEST (TOP) -->
          <tr>
            <td style="padding:25px; text-align:left; color:#222; font-size:16px;">
              <p>Thank you for choosing Amore Beach Resort!</p>
              <p>We have received your booking request and will get back to you shortly with a confirmation and further information regarding your stay.</p>
              <p>Should you have any questions in the meantime, please do not hesitate to contact us.</p>
              <p>We look forward to welcoming you and making your stay as pleasant and enjoyable as possible.</p>
              <p style="margin-top:18px;">Kind regards,<br/><strong>Amore Beach Resort</strong></p>
            </td>
          </tr>

          <!-- BOOKING DETAILS -->
          <tr>
            <td style="padding:0 25px;">
              <table width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 0; color:#555;">Check-in</td>
                  <td style="padding:6px 0; text-align:right;"><strong>${bookingDetails.checkIn}</strong></td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#555;">Check-out</td>
                  <td style="padding:6px 0; text-align:right;"><strong>${bookingDetails.checkOut}</strong></td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#555;">Nights</td>
                  <td style="padding:6px 0; text-align:right;">${bookingDetails.nights}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#555;">Guests</td>
                  <td style="padding:6px 0; text-align:right;">
                    Adults: ${bookingDetails.adults}, Children: ${bookingDetails.children}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ROOMS -->
          <tr>
            <td style="padding:25px;">
              <h3 style="margin-bottom:10px; color:#222;">Room Details</h3>
              <table width="100%" style="border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid #ddd;">
                    <th align="left" style="padding-bottom:8px;">Room</th>
                    <th align="center" style="padding-bottom:8px;">Qty</th>
                    <th align="right" style="padding-bottom:8px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${roomsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- GUEST INFO -->
          <tr>
            <td style="padding:0 25px 20px;">
              <h3 style="color:#222;">Guest Information</h3>
              <p style="margin:6px 0;"><strong>Name:</strong> ${bookingDetails.guest.firstName} ${bookingDetails.guest.lastName}</p>
              <p style="margin:6px 0;"><strong>Email:</strong> ${bookingDetails.guest.email}</p>
              <p style="margin:6px 0;"><strong>Mobile:</strong> ${bookingDetails.guest.mobile}</p>
              <p style="margin:6px 0;"><strong>Address:</strong> ${bookingDetails.guest.address}, ${bookingDetails.guest.city}, ${bookingDetails.guest.country}</p>
              ${
                bookingDetails.guest.notes
                  ? `<p style="margin:6px 0;"><strong>Notes:</strong> ${bookingDetails.guest.notes}</p>`
                  : ""
              }
            </td>
          </tr>


          <!-- TOTAL (BOTTOM) -->
          <tr>
            <td style="padding:20px 25px; background:#f9f9f9;">
              <table width="100%">
                <tr>
                  <td style="font-size:18px;"><strong>Total Price</strong></td>
                  <td style="font-size:18px; text-align:right;"><strong>$${bookingDetails.totalPrice}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px; text-align:center; color:#777; font-size:12px;">
              ${hotelName}<br/>
              Booking created at ${bookingDetails.createdAt}
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`
}

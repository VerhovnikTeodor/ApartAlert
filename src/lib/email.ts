import nodemailer from "nodemailer";

// Create transporter - using Gmail for development
// For production, use a proper email service like SendGrid, AWS SES, etc.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface ApartmentNotification {
  userEmail: string;
  userName: string;
  searchName: string;
  apartment: {
    id: number;
    title: string;
    price: string;
    location: string;
    bedrooms: number;
    area: number;
    rating: number;
  };
}

export async function sendNewApartmentNotification(
  notification: ApartmentNotification
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userEmail, userName, searchName, apartment } = notification;

    const apartmentUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/?apartmentId=${apartment.id}`;

    const mailOptions = {
      from: `"ApartAlert" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `🏠 New Apartment Match: ${apartment.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .apartment-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
            .detail { margin: 10px 0; }
            .detail-label { font-weight: bold; color: #667eea; }
            .price { font-size: 24px; color: #2ecc71; font-weight: bold; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            .stars { color: #ffd700; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 New Apartment Match!</h1>
              <p>We found a new apartment matching your saved search: <strong>"${searchName}"</strong></p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Great news! A new apartment has been listed that matches your search criteria.</p>
              
              <div class="apartment-card">
                <h2>${apartment.title}</h2>
                <div class="price">€${apartment.price}/month</div>
                
                <div class="detail">
                  <span class="detail-label">📍 Location:</span> ${
                    apartment.location
                  }
                </div>
                <div class="detail">
                  <span class="detail-label">🛏️ Bedrooms:</span> ${
                    apartment.bedrooms
                  }
                </div>
                <div class="detail">
                  <span class="detail-label">📐 Area:</span> ${
                    apartment.area
                  } m²
                </div>
                <div class="detail">
                  <span class="detail-label">⭐ Rating:</span> 
                  <span class="stars">${"★".repeat(
                    apartment.rating
                  )}${"☆".repeat(5 - apartment.rating)}</span>
                  (${apartment.rating}/5)
                </div>
                
                <a href="${apartmentUrl}" class="btn">View Apartment Details</a>
              </div>
              
              <p><strong>Don't miss out!</strong> This apartment won't be available for long.</p>
              <p>To manage your saved searches or turn off notifications, visit your <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/saved-searches">saved searches page</a>.</p>
            </div>
            <div class="footer">
              <p>You received this email because you have an active saved search on ApartAlert.</p>
              <p>© ${new Date().getFullYear()} ApartAlert. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Apartment Match for "${searchName}"

Hi ${userName},

A new apartment has been listed that matches your search criteria:

${apartment.title}
Price: €${apartment.price}/month
Location: ${apartment.location}
Bedrooms: ${apartment.bedrooms}
Area: ${apartment.area} m²
Rating: ${apartment.rating}/5

View details: ${apartmentUrl}

To manage your saved searches, visit: ${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/saved-searches
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${userEmail} for apartment ${apartment.id}`);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error sending email:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

interface DigestNotification {
  userEmail: string;
  userName: string;
  frequency: "daily" | "weekly";
  apartments: Array<{
    id: number;
    title: string;
    price: string;
    location: string;
    bedrooms: number;
    area: number;
    rating: number;
    searchName: string;
  }>;
}

export async function sendDigestEmail(
  notification: DigestNotification
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userEmail, userName, frequency, apartments } = notification;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const frequencyText = frequency === "daily" ? "Daily" : "Weekly";

    const apartmentCards = apartments
      .map(
        (apartment) => `
      <div class="apartment-card">
        <h3>${apartment.title}</h3>
        <div class="search-badge">From: "${apartment.searchName}"</div>
        <div class="price">€${apartment.price}/month</div>
        
        <div class="detail">
          <span class="detail-label">📍 Location:</span> ${apartment.location}
        </div>
        <div class="detail">
          <span class="detail-label">🛏️ Bedrooms:</span> ${apartment.bedrooms}
        </div>
        <div class="detail">
          <span class="detail-label">📐 Area:</span> ${apartment.area} m²
        </div>
        <div class="detail">
          <span class="detail-label">⭐ Rating:</span> 
          <span class="stars">${"★".repeat(apartment.rating)}${"☆".repeat(
          5 - apartment.rating
        )}</span>
          (${apartment.rating}/5)
        </div>
        
        <a href="${appUrl}/?apartmentId=${
          apartment.id
        }" class="btn-small">View Details</a>
      </div>
    `
      )
      .join("");

    const mailOptions = {
      from: `"ApartAlert" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `🏠 Your ${frequencyText} Apartment Digest - ${
        apartments.length
      } New Match${apartments.length > 1 ? "es" : ""}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .apartment-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
            .search-badge { display: inline-block; background: #e8eaf6; color: #667eea; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-bottom: 10px; }
            .detail { margin: 10px 0; font-size: 14px; }
            .detail-label { font-weight: bold; color: #667eea; }
            .price { font-size: 20px; color: #2ecc71; font-weight: bold; margin: 10px 0; }
            .btn-small { display: inline-block; background: #667eea; color: white; padding: 8px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-size: 14px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            .stars { color: #ffd700; }
            .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
            .summary-number { font-size: 36px; font-weight: bold; color: #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Your ${frequencyText} Apartment Digest</h1>
              <p>New apartments matching your saved searches</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <div class="summary">
                <div class="summary-number">${apartments.length}</div>
                <p>New apartment${
                  apartments.length > 1 ? "s" : ""
                } matching your criteria</p>
              </div>
              
              <p>Here are all the new apartments we found for you:</p>
              
              ${apartmentCards}
              
              <p style="margin-top: 30px;"><strong>Don't miss out!</strong> These apartments might not be available for long.</p>
              <p>To manage your notification preferences, visit your <a href="${appUrl}/settings">settings page</a>.</p>
            </div>
            <div class="footer">
              <p>You received this ${frequency} digest because you have active saved searches on ApartAlert.</p>
              <p>© ${new Date().getFullYear()} ApartAlert. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Your ${frequencyText} Apartment Digest - ${apartments.length} New Match${
        apartments.length > 1 ? "es" : ""
      }

Hi ${userName},

You have ${apartments.length} new apartment${
        apartments.length > 1 ? "s" : ""
      } matching your saved searches:

${apartments
  .map(
    (apt, idx) => `
${idx + 1}. ${apt.title} (From "${apt.searchName}")
   Price: €${apt.price}/month
   Location: ${apt.location}
   Bedrooms: ${apt.bedrooms} | Area: ${apt.area} m² | Rating: ${apt.rating}/5
   View: ${appUrl}/?apartmentId=${apt.id}
`
  )
  .join("\n")}

To manage your notification preferences, visit: ${appUrl}/settings
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(
      `✅ ${frequencyText} digest email sent to ${userEmail} with ${apartments.length} apartments`
    );
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error sending digest email:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Verify transporter configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("✅ Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("❌ Email server verification failed:", error);
    return false;
  }
}

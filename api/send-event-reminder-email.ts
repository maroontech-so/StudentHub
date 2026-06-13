import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

function getResendConfig() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim() || "re_dH4sb2mM_8qFhcnntLemF4XFZf9YwXutC";
  const verifiedDomain = (process.env.RESEND_DOMAIN_VERIFIED || "").trim() || "studenthubmku.xyz";
  
  // If we have a verified domain (either from env or fallback), we are in production sending mode.
  const isSandbox = !verifiedDomain || verifiedDomain.includes("resend.dev");
  
  const fromEmail = isSandbox
    ? "MKU Law Student Hub <onboarding@resend.dev>"
    : `MKU Law Student Hub <info@${verifiedDomain}>`;
    
  const isSendingToTestOnly = isSandbox;
  const testEmail = "micahprince60@gmail.com";
  
  return { apiKey, fromEmail, isSendingToTestOnly, testEmail, verifiedDomain };
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { applicantEmail, applicantName, eventTitle, eventDate, eventVenue } = req.body;
    const { apiKey, fromEmail, isSendingToTestOnly, testEmail, verifiedDomain } = getResendConfig();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upcoming Assembly Reminder</title>
      </head>
      <body style="background-color: #020203; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #020203; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #09090b; border: 1px solid #1f1f23; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <!-- Header -->
                <tr>
                  <td style="padding: 35px 40px 25px 40px; border-bottom: 1px solid #1f1f23; text-align: center; background: linear-gradient(135deg, #09090b 0%, #121214 100%);">
                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; color: #fcdd09; font-size: 24px; font-weight: 900; letter-spacing: 6px; text-transform: uppercase;">
                      MKU LAW
                    </p>
                    <p style="margin: 5px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #f59e0b; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                      &bull; COMRADE ASSEMBLY ALERT &bull;
                    </p>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <!-- Urgent Pill -->
                          <div style="text-align: left; margin-bottom: 20px;">
                            <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); color: #f59e0b; font-size: 10px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 6px;">
                              ⏳ HAPPENING SOON
                            </span>
                          </div>

                          <h1 style="margin: 0 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 950; color: #ffffff; line-height: 1.3; text-transform: uppercase; text-align: left;">
                            EVENT ASSEMBLY REMINDER
                          </h1>

                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14.5px; line-height: 1.6; color: #e4e4e7; margin: 15px 0; text-align: left;">
                            Dear <strong>${applicantName}</strong>,
                          </p>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 15px 0; text-align: left;">
                            This is an automated prompt reminding you that the legislative assembly or student symposium you RSVP'ed for will begin shortly. Please allocate sufficient travel/entry setup time.
                          </p>

                          <!-- Pass Layout -->
                          <div style="background-color: #121214; border: 1px solid #1f1f23; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: left;">
                            <p style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; text-transform: uppercase;">
                              ${eventTitle}
                            </p>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 15px; border-top: 1px solid #1f1f23; padding-top: 15px;">
                              <tr>
                                <td style="padding-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #71717a; text-transform: uppercase; width: 120px;">
                                  Chamber Venue
                                </td>
                                <td style="padding-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; color: #e4e4e7;">
                                  ${eventVenue}
                                </td>
                              </tr>
                              <tr>
                                <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #71717a; text-transform: uppercase;">
                                  Date & Time
                                </td>
                                <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; color: #fcdd09;">
                                  ${eventDate}
                                </td>
                              </tr>
                            </table>
                          </div>

                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; line-height: 1.6; color: #71717a; text-align: center; margin: 30px 0 10px 0;">
                            Ensure your Digital E-Pass QR code is saved on your responsive device layout to bypass entry security checks smoothly.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 25px 40px; background-color: #050506; border-top: 1px solid #1f1f23; text-align: center;">
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #52525b; line-height: 1.4;">
                      This notification was issued automatically by the Student Parliament portal administrator. To manage future email alerts, update your digital profile setup.
                    </p>
                    <p style="margin: 10px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #3f3f46; letter-spacing: 1px;">
                      Trigger Destination: ${applicantEmail} &bull; Verified: ${verifiedDomain}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const payload = {
      from: fromEmail,
      to: isSendingToTestOnly ? [testEmail] : [applicantEmail],
      subject: `[Reminder] Upcoming Session: ${eventTitle}`,
      html: htmlContent
    };

    console.log("[Resend Seats-Reminder] Mailing notification pass:", {
      from: payload.from,
      to: payload.to,
      subject: payload.subject
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[Resend Seats-Reminder] API Rejection:", responseData);
      throw new Error(JSON.stringify(responseData));
    }

    return res.status(200).json({ success: true, response: responseData });
  } catch (err: any) {
    console.error("[Resend Seats-Reminder] Exception:", err);
    return res.status(500).json({ error: err.message || "Failed to dispatch event reminder." });
  }
}

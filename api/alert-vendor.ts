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
    const { vendorEmail, vendorName, businessName } = req.body;
    if (!vendorEmail) {
      return res.status(400).json({ error: "Vendor email is required" });
    }

    const { apiKey, fromEmail, isSendingToTestOnly, testEmail, verifiedDomain } = getResendConfig();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio View Notification</title>
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
                    <p style="margin: 5px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #a1a1aa; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                      MARKETPLACE LEAD DISCOVERY
                    </p>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <!-- Small Stat badge -->
                          <div style="text-align: left; margin-bottom: 20px;">
                            <span style="display: inline-block; background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); color: #4ade80; font-size: 10px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 6px;">
                              &bull; LOCAL LEAD CAPTURED
                            </span>
                          </div>

                          <h1 style="margin: 0 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 950; color: #ffffff; line-height: 1.3; text-transform: uppercase;">
                            PORTFOLIO DISCOVERY ALERT
                          </h1>

                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14.5px; line-height: 1.6; color: #e4e4e7; margin: 15px 0;">
                            Hello <strong>${vendorName || "Merchant Partner"}</strong>,
                          </p>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 15px 0;">
                            Exciting trade indicators are showing up! Your official campus enterprise profile, <strong>"${businessName}"</strong>, was just discovered and viewed by a prospective buyer on the <strong>MKU Law Student Hub Marketplace</strong>.
                          </p>
                          
                          <div style="background-color: #16161a; border: 1px solid #1f1f23; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: left;">
                            <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: bold; color: #ffffff; text-transform: uppercase; tracking: 0.5px;">Merchant Campaign Insights</p>
                            <p style="margin: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #a1a1aa;">&bull; Student interest has increased significantly this week.</p>
                            <p style="margin: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #a1a1aa;">&bull; Keep your visual streams, price points, and exclusive student-only discount rates fresh to secure orders.</p>
                          </div>

                          <!-- Button -->
                          <div style="text-align: center; margin: 30px 0 10px 0;">
                            <a href="https://studenthubmku.xyz/marketplace" target="_blank" style="background-color: #fcdd09; color: #000000; padding: 15px 30px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 800; font-size: 12px; border-radius: 10px; text-transform: uppercase; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(252, 221, 9, 0.15);">
                              Manage Business Portfolio &rarr;
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 25px 40px; background-color: #050506; border-top: 1px solid #1f1f23; text-align: center;">
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #52525b; line-height: 1.4;">
                      This is an automated performance report. To suspend lead alerts, switch off the "View Notifications" toggle in your merchant profile editing drawer.
                    </p>
                    <p style="margin: 10px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #3f3f46; letter-spacing: 1px;">
                      Target Recipient Destination: ${vendorEmail} &bull; Verified: ${verifiedDomain}
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
      to: isSendingToTestOnly ? [testEmail] : [vendorEmail],
      subject: `[Lead Alert] Your brand portfolio "${businessName}" was discovered!`,
      html: htmlContent
    };

    console.log("[Resend Alert-Vendor] Mailing lead dispatch:", {
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
      console.error("[Resend Alert-Vendor] API Error:", responseData);
      throw new Error(JSON.stringify(responseData));
    }

    return res.status(200).json({ success: true, response: responseData });
  } catch (err: any) {
    console.error("[Resend Alert-Vendor] Exception:", err);
    return res.status(500).json({ error: err.message || "Failed to notify vendor" });
  }
}

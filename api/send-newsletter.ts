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
  // Support either GET or POST, but main is POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { subject, postTitle, featuredImage, audience, emails, blocks } = req.body;
    const { apiKey, fromEmail, isSendingToTestOnly, testEmail, verifiedDomain } = getResendConfig();

    // Map content blocks to clean, inline-styled tables for robust email client rendering
    let blocksHtml = "";
    if (Array.isArray(blocks) && blocks.length > 0) {
      blocksHtml = blocks.map((block: any) => {
        if (block.type === "h1") {
          return `
            <h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; color: #ffffff; font-weight: 800; border-bottom: 2px solid #fcdd09; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${block.content || ""}
            </h2>
          `;
        } else if (block.type === "h2") {
          return `
            <h3 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: #fcdd09; font-weight: 700; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase;">
              ${block.content || ""}
            </h3>
          `;
        } else if (block.type === "image" && block.content) {
          return `
            <div style="margin: 22px 0; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; text-align: center; background-color: #09090b;">
              <img src="${block.content}" style="width: 100%; height: auto; display: block; max-width: 100%;" />
            </div>
          `;
        } else {
          const safeText = (block.content || "").replace(/\n/g, "<br/>");
          return `
            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.62; color: #c4c4c6; margin: 12px 0;">
              ${safeText || ""}
            </p>
          `;
        }
      }).join("");
    } else {
      blocksHtml = `
        <p style="font-size: 14px; line-height: 1.62; color: #c4c4c6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 12px 0;">
          Greetings students and colleagues,
        </p>
        <p style="font-size: 14px; line-height: 1.62; color: #c4c4c6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 12px 0;">
          A new official bulletin briefing has been enacted: <strong>${postTitle || "Latest Gazette Release"}</strong>. Open the live parliament hub platform to inspect files, review records and participate in active student discussions.
        </p>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject || "Campus Briefing"}</title>
      </head>
      <body style="background-color: #020203; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #020203; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #09090b; border: 1px solid #1f1f23; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <!-- Header Banner -->
                <tr>
                  <td style="padding: 35px 40px 25px 40px; border-bottom: 1px solid #1f1f23; text-align: center; background: linear-gradient(135deg, #09090b 0%, #121214 100%);">
                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; color: #fcdd09; font-size: 24px; font-weight: 900; letter-spacing: 6px; text-transform: uppercase;">
                      MKU LAW
                    </p>
                    <p style="margin: 5px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #a1a1aa; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                      STUDENT PARLIAMENT HUB
                    </p>
                  </td>
                </tr>

                <!-- Featured Image -->
                ${featuredImage ? `
                <tr>
                  <td style="padding: 0;">
                    <img src="${featuredImage}" alt="Cover Image" style="width: 100%; height: auto; display: block; max-width: 100%; border-bottom: 1px solid #1f1f23;" />
                  </td>
                </tr>
                ` : ""}

                <!-- Content Area -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <!-- Small Category Pill -->
                          <span style="display: inline-block; background-color: rgba(252, 221, 9, 0.1); border: 1px solid rgba(252, 221, 9, 0.2); color: #fcdd09; font-size: 10px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 6px; margin-bottom: 15px;">
                            ${(audience || "all").toUpperCase()} BULLETIN
                          </span>

                          <!-- main Title -->
                          <h1 style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.3; text-transform: uppercase; tracking: -0.5px;">
                            ${postTitle || "Special Release Board Briefing"}
                          </h1>

                          <!-- Blocks Section -->
                          <div style="margin-top: 25px; margin-bottom: 35px;">
                            ${blocksHtml}
                          </div>

                          <!-- Call to Action Button -->
                          <div style="text-align: center; margin: 35px 0 20px 0;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office: mso" href="https://studenthubmku.xyz/" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="21%" stroke="f" fillcolor="#fcdd09">
                              <w:anchorlock/>
                              <center style="color:#000000;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">ACCESS RELEASE PORTAL</center>
                            </v:roundrect>
                            <![endif]-->
                            <a href="https://studenthubmku.xyz/" target="_blank" style="background-color: #fcdd09; color: #000000; padding: 16px 32px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 800; font-size: 12px; border-radius: 12px; text-transform: uppercase; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(252, 221, 9, 0.2); transition: all 0.2s ease;">
                              Access Release Portal &rarr;
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Privacy Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #050506; border-top: 1px solid #1f1f23; text-align: center;">
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #71717a; line-height: 1.5;">
                      This broadcast is sent to members registered in the MKU Law Student Hub database.<br />
                      You can manage your subscription choices at any time directly in your account settings.
                    </p>
                    <p style="margin: 15px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 1px;">
                      Campus Registry Broadcast Code Block &bull; Verified: ${verifiedDomain}
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

    // Configure proper broadcast:
    // To protect student privacy, we set 'to' to a display group address and put students in 'bcc'.
    const emailsCount = Array.isArray(emails) ? emails.length : 0;
    
    const payload = {
      from: fromEmail,
      to: isSendingToTestOnly 
        ? [testEmail] 
        : (emailsCount === 1 ? emails : [`MKU Law Student Hub <news@${verifiedDomain}>`]),
      bcc: isSendingToTestOnly 
        ? [] 
        : (emailsCount > 1 ? emails : []),
      subject: subject || `[MKU Law Student Hub] ${postTitle || "Latest Campus Gazette"}`,
      html: htmlContent
    };

    // If there are no recipients because it's just a test send or empty list, route directly to the single test email
    if (isSendingToTestOnly || emailsCount === 0) {
      payload.to = [testEmail];
      payload.bcc = [];
    }

    console.log("[Resend Newsletter] Broadcasting campaign payload:", {
      from: payload.from,
      to: payload.to,
      bccCount: payload.bcc.length,
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
      console.error("[Resend Newsletter] Resend API rejection error:", responseData);
      throw new Error(JSON.stringify(responseData));
    }

    console.log("[Resend Newsletter] Dispatch succeeded:", responseData);
    return res.status(200).json({ success: true, response: responseData });
  } catch (err: any) {
    console.error("[Resend Newsletter] Handler exception:", err);
    return res.status(500).json({ error: err.message || "Failed to broadcast newsletter" });
  }
}

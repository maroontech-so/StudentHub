import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing support
  app.use(express.json());

  // API Route for sending newsletter
  app.post("/api/send-newsletter", async (req, res) => {
    try {
      const { subject, postTitle, featuredImage, audience, emails } = req.body;
      
      const apiKey = process.env.RESEND_API_KEY || "re_f8tdXhkb_3E1x4wxjvYdR7z7nEaVU5GCF";
      const fromEmail = "MKU Law Student Hub <onboarding@resend.dev>";
      const testEmail = "micahprince60@gmail.com";

      // Build safe HTML template
      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #1f1f23; border-radius: 20px; background-color: #0c0c0e; color: #f4f4f5; text-align: left;">
          <div style="border-bottom: 1px solid #1a1a1e; padding-bottom: 20px; margin-bottom: 25px; text-align: center;">
            <h1 style="color: #ffde00; font-size: 20px; font-weight: 900; letter-spacing: 4px; uppercase; margin: 0; font-family: monospace;">MKU LAW</h1>
            <span style="font-size: 9px; background-color: rgba(255, 222, 0, 0.1); border: 1px solid rgba(255, 222, 0, 0.25); padding: 3px 10px; border-radius: 4px; text-transform: uppercase; font-weight: bold; color: #ffde00; letter-spacing: 1px; font-family: monospace; display: inline-block; margin-top: 5px;">STUDENT HUB BROADCAST</span>
          </div>

          <h2 style="font-size: 22px; color: #ffffff; line-height: 1.3; font-weight: 800; margin-top: 0; font-family: -apple-system, system-ui, sans-serif; text-transform: uppercase;">
            ${postTitle || "Special Announcement"}
          </h2>

          ${featuredImage ? `<div style="width: 100%; border-radius: 12px; overflow: hidden; margin: 20px 0;"><img src="${featuredImage}" style="width: 100%; height: auto; max-width: 100%; display: block;" /></div>` : ""}

          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            Greetings students and colleagues,
          </p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            A new official bulletin briefing has been issued onto the digital portal: <strong>${postTitle || "Latest Gazette"}</strong>. Open the live platform to inspect documents and participate in assembly discussions.
          </p>

          <div style="margin: 35px 0; text-align: center;">
            <a href="https://studenthub-78991.web.app/" target="_blank" style="background-color: #ffde00; color: #000000; padding: 14px 28px; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 10px; text-transform: uppercase; display: inline-block; letter-spacing: 1px; font-shadow: none; font-family: -apple-system, system-ui, sans-serif;">
              Access Release Document →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #1a1a1e; margin: 30px 0;" />
          
          <p style="font-size: 10px; color: #52525b; text-align: center; font-family: monospace; line-height: 1.5; margin: 0;">
            This mailshot was triggered by the campus administrator via Resend and Firebase.<br/>
            Target Audience: <span style="color: #ffde00;">${audience.toUpperCase()}</span> (${emails ? emails.length : 0} registered subscribers)
          </p>
        </div>
      `;

      // Formulate target recipient:
      // Since Resend free-tier ONLY permits sending to the account owner (verified test email) out-of-the-box,
      // we ALWAYS deliver to 'micahprince60@gmail.com' as the primary destination.
      // However, if the user successfully verifies their domain, they will be able to send to arbitrary emails.
      // We will loop/include any configured custom domain emails if the API allows it,
      // or send directly to the specific test email.
      const isSendingToTestOnly = !process.env.RESEND_DOMAIN_VERIFIED;
      
      const payload = {
        from: fromEmail,
        to: isSendingToTestOnly ? [testEmail] : (emails && emails.length > 0 ? emails : [testEmail]),
        subject: subject || `[MKU Law Hub] ${postTitle || "Latest Updates"}`,
        html: htmlContent
      };

      console.log("[Backend] Triggering Resend newsletter dispatch:", payload);

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
        throw new Error(JSON.stringify(responseData));
      }

      console.log("[Backend] Resend API success:", responseData);
      res.json({ success: true, response: responseData });
    } catch (err: any) {
      console.error("[Backend] Resend API error:", err);
      res.status(500).json({ error: err.message || "Failed to communicate with Resend" });
    }
  });

  // API Route for alerting vendor on profile view
  app.post("/api/alert-vendor", async (req, res) => {
    try {
      const { vendorEmail, vendorName, businessName } = req.body;
      if (!vendorEmail) {
        return res.status(400).json({ error: "Vendor email is required" });
      }

      const apiKey = process.env.RESEND_API_KEY || "re_f8tdXhkb_3E1x4wxjvYdR7z7nEaVU5GCF";
      const fromEmail = "MKU Law Student Hub <onboarding@resend.dev>";
      const testEmail = "micahprince60@gmail.com";

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #1f1f23; border-radius: 20px; background-color: #0c0c0e; color: #f4f4f5; text-align: left;">
          <div style="border-bottom: 1px solid #1a1a1e; padding-bottom: 20px; margin-bottom: 25px; text-align: center;">
            <h1 style="color: #ffde00; font-size: 20px; font-weight: 900; letter-spacing: 4px; uppercase; margin: 0; font-family: monospace;">MKU LAW</h1>
            <span style="font-size: 9px; background-color: rgba(255, 222, 0, 0.1); border: 1px solid rgba(255, 222, 0, 0.25); padding: 3px 10px; border-radius: 4px; text-transform: uppercase; font-weight: bold; color: #ffde00; letter-spacing: 1px; font-family: monospace; display: inline-block; margin-top: 5px;">MARKETPLACE HIGHLIGHT</span>
          </div>

          <h2 style="font-size: 22px; color: #ffffff; line-height: 1.3; font-weight: 800; margin-top: 0; font-family: -apple-system, system-ui, sans-serif; text-transform: uppercase;">
            Profile Discovery Alert!
          </h2>

          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            Hello <strong>${vendorName || "Business Owner"}</strong>,
          </p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            Exciting news! Your local campus enterprise profile, <strong>"${businessName}"</strong>, was just discovered and viewed by a prospective buyer on the <strong>MKU Law Student Hub Marketplace</strong>.
          </p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            Keep your visual stream, price points, and promotional discounts updated since student interest is currently high!
          </p>

          <div style="margin: 35px 0; text-align: center;">
            <a href="https://studenthub-78991.web.app/marketplace" target="_blank" style="background-color: #ffde00; color: #000000; padding: 14px 28px; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 10px; text-transform: uppercase; display: inline-block; letter-spacing: 1px; font-shadow: none; font-family: -apple-system, system-ui, sans-serif;">
              Manage Business Portfolio →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #1a1a1e; margin: 30px 0;" />
          
          <p style="font-size: 10px; color: #52525b; text-align: center; font-family: monospace; line-height: 1.5; margin: 0;">
            This real-time notification can be toggled off at any time under your Brand Portfolio update settings view.<br/>
            Destination: <span style="color: #ffde00;">${vendorEmail}</span>
          </p>
        </div>
      `;

      const isSendingToTestOnly = !process.env.RESEND_DOMAIN_VERIFIED;
      const payload = {
        from: fromEmail,
        to: isSendingToTestOnly ? [testEmail] : [vendorEmail],
        subject: `[Lead Alert] Your business "${businessName}" was viewed!`,
        html: htmlContent
      };

      console.log("[Backend] Dispatching Vendor Discovery alert:", payload);

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
        throw new Error(JSON.stringify(responseData));
      }

      res.json({ success: true, response: responseData });
    } catch (err: any) {
      console.error("[Backend] Vendor Alert API error:", err);
      res.status(500).json({ error: err.message || "Failed to alert vendor" });
    }
  });

  // API Route for sending Event Registration pass email feedback
  app.post("/api/send-event-registration-email", async (req, res) => {
    try {
      const { applicantEmail, applicantName, eventTitle, eventDate, eventVenue, customFields } = req.body;
      
      const apiKey = process.env.RESEND_API_KEY || "re_f8tdXhkb_3E1x4wxjvYdR7z7nEaVU5GCF";
      const fromEmail = "MKU Law Student Hub <onboarding@resend.dev>";
      const testEmail = "micahprince60@gmail.com";

      // Formulate custom questions/responses
      let fieldsHtml = "";
      if (customFields && Object.keys(customFields).length > 0) {
        fieldsHtml = `<div style="background-color: #16161a; padding: 15px; border-radius: 12px; border: 1px solid #27272a; margin: 15px 0;">
          <h4 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #ffde00; font-family: monospace;">Submitted RSVP Details</h4>`;
        for (const [k, v] of Object.entries(customFields)) {
          fieldsHtml += `<p style="margin: 6px 0; font-size: 13px; color: #a1a1aa;"><strong style="color: #ffffff;">${k}:</strong> ${v}</p>`;
        }
        fieldsHtml += `</div>`;
      }

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #1f1f23; border-radius: 20px; background-color: #0c0c0e; color: #f4f4f5; text-align: left;">
          <div style="border-bottom: 1px solid #1a1a1e; padding-bottom: 20px; margin-bottom: 25px; text-align: center;">
            <h1 style="color: #ffde00; font-size: 20px; font-weight: 900; letter-spacing: 4px; uppercase; margin: 0; font-family: monospace;">MKU LAW</h1>
            <span style="font-size: 9px; background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); padding: 3px 10px; border-radius: 4px; text-transform: uppercase; font-weight: bold; color: #22c55e; letter-spacing: 1px; font-family: monospace; display: inline-block; margin-top: 5px;">RSVP SEAT CONFIRMED</span>
          </div>

          <h2 style="font-size: 22px; color: #ffffff; line-height: 1.3; font-weight: 800; margin-top: 0; font-family: -apple-system, system-ui, sans-serif; text-transform: uppercase;">
            You are Registered!
          </h2>

          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            Dear <strong>${applicantName}</strong>,
          </p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            Your delegate entry pass for the upcoming council symposium/assembly is officially certified.
          </p>

          <div style="background-color: #121214; border: 1px solid #1f1f23; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #ffffff; text-transform: uppercase;">${eventTitle}</p>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #a1a1aa;"><strong style="color: #ffde00;">Date & Time:</strong> ${eventDate}</p>
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;"><strong style="color: #ffde00;">Chamber / Venue:</strong> ${eventVenue}</p>
          </div>

          ${fieldsHtml}

          <p style="font-size: 12.5px; line-height: 1.6; color: #71717a; text-align: center; margin: 25px 0 0 0;">
            Please present your Digital E-Pass QR code when entering the symposium venue.
          </p>

          <hr style="border: none; border-top: 1px solid #1a1a1e; margin: 30px 0;" />
          
          <p style="font-size: 10px; color: #52525b; text-align: center; font-family: monospace; line-height: 1.5; margin: 0;">
            This dynamic feedback notification was triggered automatically by the student hub registry.<br/>
            Recipient Destination: <span style="color: #ffde00;">${applicantEmail}</span>
          </p>
        </div>
      `;

      const isSendingToTestOnly = !process.env.RESEND_DOMAIN_VERIFIED;
      const payload = {
        from: fromEmail,
        to: isSendingToTestOnly ? [testEmail] : [applicantEmail],
        subject: `[Registry Secured] Your seat for ${eventTitle} is reserved!`,
        html: htmlContent
      };

      console.log("[Backend] Dispatching RSVP pass email:", payload);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      res.json({ success: true, response: responseData });
    } catch (err: any) {
      console.error("[Backend] Registry Confirmation API error:", err);
      res.status(500).json({ error: err.message || "Failed to dispatch registration confirmation email." });
    }
  });

  // API Route for sending Event Reminders
  app.post("/api/send-event-reminder-email", async (req, res) => {
    try {
      const { applicantEmail, applicantName, eventTitle, eventDate, eventVenue } = req.body;
      
      const apiKey = process.env.RESEND_API_KEY || "re_f8tdXhkb_3E1x4wxjvYdR7z7nEaVU5GCF";
      const fromEmail = "MKU Law Student Hub <onboarding@resend.dev>";
      const testEmail = "micahprince60@gmail.com";

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #1f1f23; border-radius: 20px; background-color: #0c0c0e; color: #f4f4f5; text-align: left;">
          <div style="border-bottom: 1px solid #1a1a1e; padding-bottom: 20px; margin-bottom: 25px; text-align: center;">
            <h1 style="color: #ffde00; font-size: 20px; font-weight: 900; letter-spacing: 4px; uppercase; margin: 0; font-family: monospace;">MKU LAW</h1>
            <span style="font-size: 9px; background-color: rgba(255, 222, 0, 0.1); border: 1px solid rgba(255, 222, 0, 0.25); padding: 3px 10px; border-radius: 4px; text-transform: uppercase; font-weight: bold; color: #ffde00; letter-spacing: 1px; font-family: monospace; display: inline-block; margin-top: 5px;">COMRADE EVENT REMINDER</span>
          </div>

          <h2 style="font-size: 22px; color: #ffffff; line-height: 1.3; font-weight: 800; margin-top: 0; font-family: -apple-system, system-ui, sans-serif; text-transform: uppercase;">
            Event Happening Soon!
          </h2>

          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            Dear <strong>${applicantName}</strong>,
          </p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #a1a1aa;">
            This is a friendly reminder that the event assembly you registered for is happening soon! Please make sure to make your way to the physical or virtual venue on time.
          </p>

          <div style="background-color: #121214; border: 1px solid #1f1f23; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #ffffff; text-transform: uppercase;">${eventTitle}</p>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #a1a1aa;"><strong style="color: #ffde00;">Date & Time:</strong> ${eventDate}</p>
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;"><strong style="color: #ffde00;">Chamber / Venue:</strong> ${eventVenue}</p>
          </div>

          <p style="font-size: 12.5px; line-height: 1.6; color: #71717a; text-align: center; margin: 25px 0 0 0;">
            Ensure you have your digital E-Pass with you. We look forward to seeing you there!
          </p>

          <hr style="border: none; border-top: 1px solid #1a1a1e; margin: 30px 0;" />
          
          <p style="font-size: 10px; color: #52525b; text-align: center; font-family: monospace; line-height: 1.5; margin: 0;">
            This automated reminder was triggered by the campus administrator.<br/>
            Notification Destination: <span style="color: #ffde00;">${applicantEmail}</span>
          </p>
        </div>
      `;

      const isSendingToTestOnly = !process.env.RESEND_DOMAIN_VERIFIED;
      const payload = {
        from: fromEmail,
        to: isSendingToTestOnly ? [testEmail] : [applicantEmail],
        subject: `[Reminder] Upcoming Event Assembly: ${eventTitle}`,
        html: htmlContent
      };

      console.log("[Backend] Dispatching Event Reminder email:", payload);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      res.json({ success: true, response: responseData });
    } catch (err: any) {
      console.error("[Backend] Event Reminder API error:", err);
      res.status(500).json({ error: err.message || "Failed to dispatch reminder." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

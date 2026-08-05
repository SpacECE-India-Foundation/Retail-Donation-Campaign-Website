import fs from "fs";
import path from "path";

// Read local logo image & convert to Base64 Data URI
const logoBuffer = fs.readFileSync(
    path.join(process.cwd(), "assets", "spacecelogo.png")
);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

export const campaignMilestoneUpdateTemplate = ({
    donorName,
    campaignTitle,
    milestones = [],
    amountRaised,
    targetAmount,
    campaignLink
}) => {
    // Dynamically calculate overall completion percentage safely
    const completionPercentage = targetAmount > 0 
        ? Math.min(Math.round((amountRaised / targetAmount) * 100), 100) 
        : 0;

    // Render multiple milestone cards dynamically
    const milestoneCards = milestones
        .map(
            (milestone) => `
            <!-- INDIVIDUAL MILESTONE CARD -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate;">
              <tr>
                <td style="padding: 20px 24px;">
                  
                  <span style="display: inline-block; background-color: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid #86efac; margin-bottom: 10px;">
                    🎯 Milestone Achieved
                  </span>

                  <h3 style="margin: 6px 0 8px 0; color: #0f172a; font-size: 17px; font-weight: 700;">
                    ${milestone.title}
                  </h3>

                  <p style="margin: 0; font-size: 14px; line-height: 22px; color: #475569;">
                    ${milestone.description}
                  </p>

                </td>
              </tr>
            </table>
            `
        )
        .join("");

    return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<title>Campaign Milestone Update - SpacECE</title>

<style type="text/css">
  /* Client-specific Resets */
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  
  /* Reset Styles */
  body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

  /* Mobile Responsive Styles */
  @media screen and (max-width: 600px) {
    .email-container {
      width: 100% !important;
      max-width: 100% !important;
      border-radius: 0px !important;
    }
    .content-padding {
      padding: 28px 20px !important;
    }
    .header-padding {
      padding: 36px 20px !important;
    }
    .metric-card {
      display: block !important;
      width: 100% !important;
      margin-bottom: 12px !important;
    }
    .cta-button {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
      text-align: center !important;
    }
  }
</style>

</head>

<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 10px;">

      <!-- MAIN CONTAINER -->
      <table role="presentation" class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">

        <!-- HEADER WITH BASE64 LOGO -->
        <tr>
          <td class="header-padding" align="center" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 48px 40px; text-align: center;">
            <img src="${logoBase64}" alt="SpacECE Logo" width="110" style="display: block; margin: 0 auto 24px auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; tracking-tight: -0.02em;">Great News! 🎉</h1>
            <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 15px; font-weight: 500; line-height: 22px;">A campaign you supported has reached key milestones!</p>
          </td>
        </tr>

        <!-- BODY CONTENT -->
        <tr>
          <td class="content-padding" style="padding: 40px 40px 32px 40px;">
            
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">Hello ${donorName},</h2>
            
            <p style="margin: 0 0 8px 0; font-size: 15px; line-height: 26px; color: #475569;">
              Thanks to your amazing support, <strong style="color: #0f172a;">${campaignTitle}</strong> is making unbelievable progress. Here are the major achievements we have unlocked together!
            </p>

            <!-- CAMPAIGN PROGRESS & FUNDING SUMMARY -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px;">
              <tr>
                <td>
                  <!-- PROGRESS BAR SECTION -->
                  <div style="margin-bottom: 16px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 8px;">
                      <tr>
                        <td style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Overall Campaign Progress</td>
                        <td align="right" style="color: #059669; font-size: 15px; font-weight: 800;">${completionPercentage}%</td>
                      </tr>
                    </table>
                    
                    <!-- DYNAMIC PROGRESS BAR -->
                    <div style="background-color: #e2e8f0; border-radius: 9999px; height: 10px; width: 100%; overflow: hidden;">
                      <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); width: ${completionPercentage}%; height: 100%; border-radius: 9999px;"></div>
                    </div>
                  </div>

                  <!-- FUNDING METRICS GRID -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td class="metric-card" width="48%" style="background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase;">Amount Raised</div>
                        <div style="color: #059669; font-size: 18px; font-weight: 800; margin-top: 2px;">₹${amountRaised}</div>
                      </td>
                      <td width="4%"></td>
                      <td class="metric-card" width="48%" style="background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase;">Target Goal</div>
                        <div style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 2px;">₹${targetAmount}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- DYNAMIC MILESTONE CARDS LIST -->
            ${milestoneCards}

            <!-- CTA BUTTON -->
            <div style="text-align: center; margin-top: 36px;">
              <a href="${campaignLink}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);">
                View Campaign Progress
              </a>
            </div>

            <!-- THANK YOU NOTE BOX -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 36px; background-color: #fffbebf5; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="margin: 0; font-size: 13px; line-height: 22px; color: #78350f;">
                    💚 <strong>Thank you for being the driving force!</strong> Your generosity helps us reach these critical goals and transform lives through early education.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background-color: #0f172a; padding: 32px 20px; text-align: center;">
            <p style="color: #f8fafc; margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 0.2px;">
              SpacECE India Foundation
            </p>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 12px; line-height: 18px;">
              Empowering Futures Through Early Childhood Excellence
            </p>
            <p style="margin-top: 16px; margin-bottom: 0;">
              <a href="https://spacece.in" style="color: #fbbf24; text-decoration: none; font-size: 13px; font-weight: 600;">
                www.spacece.in
              </a>
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
};
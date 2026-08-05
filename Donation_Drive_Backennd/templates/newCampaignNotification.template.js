export const newCampaignNotificationTemplate = ({
    donorName,
    campaignTitle,
    campaignDescription,
    campaignTimeline,
    campaignImage,
    campaignLink
}) => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<title>New Campaign - SpacECE</title>

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

        <!-- HEADER -->
        <tr>
          <td class="header-padding" align="center" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 48px 40px; text-align: center;">
            <img src="https://lh7-us.googleusercontent.com/sitesv-images-rt/ACHe0d3YmwCmZxmhGgdDyAMEdurQvV_AXK6khHZIkcLYrVQ2R_iAROxhcAZP-yQIedodIMJ3iFonv2MyEItaRNHp72D7BAcFUhKPgyW5m_p9jbRB38um8HWdq4eM0_OX9D9yqiwdfD0-jZBcK5ig-Q1R8wKfHvMM6ONfGpNo15XlMxWiekIqOdOmNwgZuUNnkCg=w16383" alt="SpacECE Logo" width="110" style="display: block; margin: 0 auto 24px auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />
            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; tracking-tight: -0.02em;">New Initiative Needs Your Support ❤️</h1>
            <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 15px; font-weight: 500; line-height: 22px;">Join us in making another powerful impact together.</p>
          </td>
        </tr>

        <!-- BODY CONTENT -->
        <tr>
          <td class="content-padding" style="padding: 40px 40px 32px 40px;">
            
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">Hello ${donorName},</h2>
            
            <p style="margin: 0; font-size: 15px; line-height: 26px; color: #475569;">
              Because of your wonderful past support with <strong style="color: #0f172a;">SpacECE India Foundation</strong>, we wanted to personally share a new campaign that we have just launched. Your continuous support helps us bring meaningful change to early childhood education and development.
            </p>

            ${
                campaignImage
                    ? `
            <!-- CAMPAIGN IMAGE -->
            <div style="margin-top: 24px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
              <img src="${campaignImage}" alt="${campaignTitle}" style="width: 100%; display: block; max-height: 280px; object-fit: cover;" />
            </div>
            `
                    : ""
            }

            <!-- CAMPAIGN DETAILS CARD -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate;">
              <tr>
                <td style="padding: 24px;">
                  
                  <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                    ${campaignTitle}
                  </h3>

                  <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
                    ${campaignDescription}
                  </p>

                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 12px;">
                    <tr>
                      <td style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Campaign Duration
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #0f172a; font-size: 14px; font-weight: 600; padding-top: 4px;">
                        ${campaignTimeline}
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>

            <!-- CTA BUTTON -->
            <div style="text-align: center; margin-top: 36px;">
              <a href="${campaignLink}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);">
                Support This Campaign
              </a>
            </div>

            <!-- THANK YOU NOTE BOX -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 36px; background-color: #fffbebf5; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="margin: 0; font-size: 13px; line-height: 22px; color: #78350f;">
                    🌟 <strong>Every contribution matters.</strong> Whether you choose to donate or share this initiative with your network, you are helping us build a better future. Thank you for being a vital part of our mission!
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
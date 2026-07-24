// export const donationVerifiedTemplate = ({
//     donorName,
//     campaignName,
//     donationAmount,
//     transactionId,
//     certificateLink
// }) => {
//     return `
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <title>Donation Verified</title>
// </head>

// <body style="margin:0;padding:40px;background:#f4f7fb;font-family:Arial,sans-serif;">

// <div style="
// max-width:700px;
// margin:auto;
// background:white;
// border-radius:14px;
// overflow:hidden;
// box-shadow:0 8px 25px rgba(0,0,0,.08);
// ">

// <div style="
// background:#1F4E79;
// padding:30px;
// text-align:center;
// color:white;
// ">

// <h1 style="margin:0;">
// 🎉 Donation Verified Successfully
// </h1>

// <p style="margin-top:10px;">
// SPACECE INDIA FOUNDATION
// </p>

// </div>

// <div style="padding:35px;">

// <h2>Hello ${donorName},</h2>

// <p>
// Thank you for supporting <strong>${campaignName}</strong>.
// </p>

// <p>
// Your donation has been successfully verified by our administration team.
// </p>

// <hr>

// <table style="width:100%;font-size:16px;line-height:2;">
// <tr>
// <td><strong>Campaign</strong></td>
// <td>${campaignName}</td>
// </tr>

// <tr>
// <td><strong>Amount</strong></td>
// <td>₹${donationAmount}</td>
// </tr>

// <tr>
// <td><strong>Transaction ID</strong></td>
// <td>${transactionId}</td>
// </tr>

// <tr>
// <td><strong>Status</strong></td>
// <td style="color:green;font-weight:bold;">
// Verified ✅
// </td>
// </tr>

// </table>

// ${
// certificateLink
// ?
// `
// <div style="text-align:center;margin-top:35px;">

// <a href="${certificateLink}"
// style="
// background:#1F4E79;
// padding:14px 28px;
// color:white;
// text-decoration:none;
// border-radius:8px;
// display:inline-block;
// font-weight:bold;
// ">
// Download Donation Certificate
// </a>

// </div>
// `
// :
// ""
// }

// <p style="margin-top:35px;">
// Your contribution will directly help us create a meaningful impact.
// Thank you for being a part of this mission.
// </p>

// </div>

// <div style="
// background:#f7f7f7;
// padding:20px;
// text-align:center;
// font-size:13px;
// color:#666;
// ">

// SPACECE INDIA FOUNDATION

// </div>

// </div>

// </body>
// </html>
// `;
// };
export const donationVerifiedTemplate = ({
    donorName,
    campaignName,
    donationAmount,
    transactionId,
    certificateLink,
    primaryLogoUrl = "https://avatars.githubusercontent.com/u/86948116?s=280&v=4",
   
}) => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<title>Donation Verified</title>

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
    .logo-column {
      display: inline-block !important;
      width: auto !important;
      padding: 0 8px !important;
    }
    .detail-row {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .detail-label {
      padding-bottom: 4px !important;
    }
    .detail-value {
      text-align: left !important;
      padding-bottom: 16px !important;
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

        <!-- HEADER WITH BRAND GRADIENT AND DUAL LOGOS -->
        <tr>
          <td class="header-padding" align="center" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 44px 30px; text-align: center;">
            
            <!-- DUAL LOGO TABLE -->
            <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 20px auto;">
              <tr>
                <!-- Primary Organization Logo -->
                <td class="logo-column" align="center" valign="middle" style="padding: 0 12px;">
                  <img src="${primaryLogoUrl}" alt="SpacECE Logo" height="48" style="display: block; height: 48px; width: auto; max-width: 130px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));" />
                </td>

                

                <!-- Secondary Partner Logo -->
              
              </tr>
            </table>

            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; tracking-tight: -0.02em;">🎉 Donation Verified Successfully</h1>
            <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px;">
              SpacECE India Foundation
            </p>
          </td>
        </tr>

        <!-- BODY CONTENT -->
        <tr>
          <td class="content-padding" style="padding: 40px 40px 32px 40px;">
            
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">Hello ${donorName},</h2>
            
            <p style="margin: 0; font-size: 15px; line-height: 26px; color: #475569;">
              Thank you for supporting <strong style="color: #0f172a;">${campaignName}</strong>. Your donation has been successfully verified by our administration team.
            </p>

            <!-- DONATION DETAILS CARD -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate;">
              <tr>
                <td style="padding: 20px 24px;">
                  
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    
                    <!-- Campaign -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Campaign
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; font-weight: 600;">
                        ${campaignName}
                      </td>
                    </tr>

                    <!-- Amount -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Amount
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #d97706; font-size: 18px; font-weight: 800;">
                        ₹${donationAmount}
                      </td>
                    </tr>

                    <!-- Transaction ID -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Transaction ID
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; font-family: monospace, monospace; font-weight: 600;">
                        ${transactionId}
                      </td>
                    </tr>

                    <!-- Status -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Status
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 12px 0;">
                        <span style="display: inline-block; background-color: #dcfce7; color: #15803d; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid #86efac;">
                          Verified ✅
                        </span>
                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>

            <!-- CONDITIONAL CERTIFICATE BUTTON WITH BRAND ACCENT -->
            ${
              certificateLink
              ? `
              <div style="text-align: center; margin-top: 36px;">
                <a href="${certificateLink}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);">
                  Download Donation Certificate 📄
                </a>
              </div>
              `
              : ""
            }

            <!-- CLOSING MESSAGE -->
            <p style="margin-top: 36px; margin-bottom: 0; font-size: 14px; line-height: 24px; color: #64748b;">
              Your contribution will directly help us create a meaningful impact. Thank you for being a vital part of this mission.
            </p>

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
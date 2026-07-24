// export const donationConfirmationTemplate = ({
//     donorName,
//     campaignName,
//     donationAmount,
//     transactionId,
//     trackingLink
// }) => {

// return `
// <!DOCTYPE html>
// <html>

// <head>

// <meta charset="UTF-8" />

// <title>Donation Confirmation</title>

// </head>

// <body style="
// margin:0;
// padding:0;
// background:#f5f7fb;
// font-family:Arial,Helvetica,sans-serif;
// ">

// <table width="100%" cellpadding="0" cellspacing="0">

// <tr>

// <td align="center" style="padding:40px 20px;">

// <table width="650" cellpadding="0" cellspacing="0"
// style="
// background:#ffffff;
// border-radius:18px;
// overflow:hidden;
// box-shadow:0px 15px 40px rgba(0,0,0,.08);
// ">

// <!-- HEADER -->

// <tr>

// <td
// style="
// background:linear-gradient(135deg,#ffb300,#ff8f00);
// padding:45px;
// text-align:center;
// ">

// <img
// src="https://lh7-us.googleusercontent.com/sitesv-images-rt/ACHe0d3YmwCmZxmhGgdDyAMEdurQvV_AXK6khHZIkcLYrVQ2R_iAROxhcAZP-yQIedodIMJ3iFonv2MyEItaRNHp72D7BAcFUhKPgyW5m_p9jbRB38um8HWdq4eM0_OX9D9yqiwdfD0-jZBcK5ig-Q1R8wKfHvMM6ONfGpNo15XlMxWiekIqOdOmNwgZuUNnkCg=w16383"
// width="120"
// style="margin-bottom:20px"
// />

// <h1
// style="
// margin:0;
// color:white;
// font-size:30px;
// ">

// Thank You ❤️

// </h1>

// <p
// style="
// margin-top:12px;
// color:white;
// font-size:16px;
// line-height:28px;
// ">

// Your donation request has been successfully received.

// </p>

// </td>

// </tr>

// <!-- BODY -->

// <tr>

// <td style="padding:40px;">

// <h2
// style="
// margin-top:0;
// color:#222;
// ">

// Hello ${donorName},

// </h2>

// <p
// style="
// font-size:16px;
// line-height:30px;
// color:#555;
// ">

// Thank you for supporting

// <b>SpacECE India Foundation.</b>

// We have successfully received your donation details.

// Our team will verify your submitted transaction and
// keep you informed throughout the verification process.

// </p>

// <!-- DONATION DETAILS -->

// <table
// width="100%"
// style="
// margin-top:35px;
// background:#fafafa;
// border-radius:12px;
// padding:25px;
// border:1px solid #eeeeee;
// ">

// <tr>

// <td style="padding:10px 0;">

// <b>Campaign</b>

// </td>

// <td align="right">

// ${campaignName}

// </td>

// </tr>

// <tr>

// <td style="padding:10px 0;">

// <b>Donation Amount</b>

// </td>

// <td align="right">

// ₹${donationAmount}

// </td>

// </tr>

// <tr>

// <td style="padding:10px 0;">

// <b>Transaction ID</b>

// </td>

// <td align="right">

// ${transactionId}

// </td>

// </tr>

// <tr>

// <td style="padding:10px 0;">

// <b>Status</b>

// </td>

// <td align="right">

// <span
// style="
// background:#FFF8E1;
// color:#ff9800;
// padding:6px 12px;
// border-radius:50px;
// font-size:13px;
// font-weight:bold;
// ">

// Pending Verification

// </span>

// </td>

// </tr>

// </table>

// <!-- CTA -->

// <div
// style="
// text-align:center;
// margin-top:45px;
// ">

// <a
// href="${trackingLink}"

// style="
// display:inline-block;
// background:#ff9800;
// color:white;
// text-decoration:none;
// padding:16px 34px;
// font-size:16px;
// font-weight:bold;
// border-radius:8px;
// ">

// Track Donation Status

// </a>

// </div>

// <!-- MESSAGE -->

// <div
// style="
// margin-top:40px;
// padding:25px;
// background:#fffaf2;
// border-left:5px solid #ff9800;
// border-radius:8px;
// ">

// <p
// style="
// margin:0;
// font-size:15px;
// line-height:28px;
// color:#555;
// ">

// 📧 Further communication regarding your donation,
// verification status and certificate (if applicable)
// will be shared with you through your registered email.

// Please keep your Transaction ID safe until verification
// is completed.

// </p>

// </div>

// </td>

// </tr>

// <!-- FOOTER -->

// <tr>

// <td
// style="
// background:#111;
// padding:35px;
// text-align:center;
// ">

// <p
// style="
// color:#ddd;
// margin:0;
// font-size:15px;
// ">

// SpacECE India Foundation

// </p>

// <p
// style="
// color:#888;
// margin-top:12px;
// font-size:13px;
// line-height:24px;
// ">

// Empowering Futures Through Early Childhood Excellence

// </p>

// <p
// style="
// margin-top:20px;
// ">

// <a
// href="https://spacece.in"
// style="
// color:#ffb300;
// text-decoration:none;
// ">

// www.spacece.in

// </a>

// </p>

// </td>

// </tr>

// </table>

// </td>

// </tr>

// </table>

// </body>

// </html>

// `;

// }
export const donationConfirmationTemplate = ({
    donorName,
    campaignName,
    donationAmount,
    transactionId,
    trackingLink
}) => {

return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<title>Donation Confirmation</title>

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

        <!-- HEADER -->
        <tr>
          <td class="header-padding" align="center" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 48px 40px; text-align: center;">
            <img src="https://lh7-us.googleusercontent.com/sitesv-images-rt/ACHe0d3YmwCmZxmhGgdDyAMEdurQvV_AXK6khHZIkcLYrVQ2R_iAROxhcAZP-yQIedodIMJ3iFonv2MyEItaRNHp72D7BAcFUhKPgyW5m_p9jbRB38um8HWdq4eM0_OX9D9yqiwdfD0-jZBcK5ig-Q1R8wKfHvMM6ONfGpNo15XlMxWiekIqOdOmNwgZuUNnkCg=w16383" alt="SpacECE Logo" width="110" style="display: block; margin: 0 auto 24px auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; tracking-tight: -0.02em;">Thank You ❤️</h1>
            <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 15px; font-weight: 500; line-height: 22px;">Your donation request has been successfully received.</p>
          </td>
        </tr>

        <!-- BODY CONTENT -->
        <tr>
          <td class="content-padding" style="padding: 40px 40px 32px 40px;">
            
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">Hello ${donorName},</h2>
            
            <p style="margin: 0; font-size: 15px; line-height: 26px; color: #475569;">
              Thank you for supporting <strong style="color: #0f172a;">SpacECE India Foundation</strong>. We have successfully received your donation details. Our team will verify your submitted transaction and keep you informed throughout the verification process.
            </p>

            <!-- DONATION DETAILS CARD -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate;">
              <tr>
                <td style="padding: 20px 24px;">
                  
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    
                    <!-- Campaign -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Campaign
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; font-weight: 600;">
                        ${campaignName}
                      </td>
                    </tr>

                    <!-- Amount -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Donation Amount
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #059669; font-size: 16px; font-weight: 700;">
                        ₹${donationAmount}
                      </td>
                    </tr>

                    <!-- Transaction ID -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Transaction ID
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; font-family: monospace, monospace; font-weight: 600;">
                        ${transactionId}
                      </td>
                    </tr>

                    <!-- Status -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Status
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 10px 0;">
                        <span style="display: inline-block; background-color: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid #fcd34d;">
                          Pending Verification
                        </span>
                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>

            <!-- CTA BUTTON -->
            <div style="text-align: center; margin-top: 36px;">
              <a href="${trackingLink}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);">
                Track Donation Status
              </a>
            </div>

            <!-- IMPORTANT NOTE BOX -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 36px; background-color: #fffbebf5; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="margin: 0; font-size: 13px; line-height: 22px; color: #78350f;">
                    📧 Further communication regarding your donation, verification status, and certificate (if applicable) will be shared with you through your registered email.
                    <br /><br />
                    Please keep your <strong>Transaction ID</strong> safe until verification is completed.
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

}
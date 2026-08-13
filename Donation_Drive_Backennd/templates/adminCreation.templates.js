// export const adminAccountCreatedTemplate = ({
//     adminName,
//     adminEmail,
//     temporaryPassword,
//     loginUrl
// }) => {

//     return `
// <!DOCTYPE html>
// <html>

// <head>
// <meta charset="UTF-8">
// <title>Welcome to SpaceECE</title>
// </head>

// <body style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f4; padding:30px;">

// <div style="max-width:650px; margin:auto; background:white; border-radius:10px; padding:30px;">

// <h2 style="color:#2563eb;">
// Welcome to SpaceECE Admin Portal
// </h2>

// <p>Dear <strong>${adminName}</strong>,</p>

// <p>
// Your administrator account has been created successfully by the Super Administrator.
// </p>

// <div style="background:#f8fafc;padding:20px;border-radius:8px;">

// <p><strong>Email</strong></p>
// <p>${adminEmail}</p>

// <p><strong>Temporary Password</strong></p>
// <p style="font-size:18px;font-weight:bold;color:#dc2626;">
// ${temporaryPassword}
// </p>

// </div>

// <p style="margin-top:25px;">
// For security reasons, please login using the credentials above and change your password immediately.
// </p>

// <div style="margin-top:30px;">
// <a
// href="${loginUrl}"
// style="
// background:#2563eb;
// color:white;
// padding:12px 25px;
// text-decoration:none;
// border-radius:6px;
// font-weight:bold;
// display:inline-block;
// ">
// Login to Admin Portal
// </a>
// </div>

// <p style="margin-top:35px;">
// If you were not expecting this account, please contact the Super Administrator immediately.
// </p>

// <hr>

// <p style="font-size:13px;color:#666;">
// This is an automated email from SpaceECE. Please do not reply to this email.
// </p>

// </div>

// </body>
// </html>
// `;
// };
export const adminAccountCreatedTemplate = ({
    adminName,
    adminEmail,
    temporaryPassword,
    loginUrl
}) => {

    return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<title>Welcome to SpacECE Admin Portal</title>

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
            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; tracking-tight: -0.02em;">Welcome to Admin Portal</h1>
            <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 15px; font-weight: 500; line-height: 22px;">Retail Donation Management System</p>
          </td>
        </tr>

        <!-- BODY CONTENT -->
        <tr>
          <td class="content-padding" style="padding: 40px 40px 32px 40px;">
            
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">Dear ${adminName},</h2>
            
            <p style="margin: 0; font-size: 15px; line-height: 26px; color: #475569;">
              Aapko <strong style="color: #0f172a;">Retail Donation Management System</strong> Retal Donation Drive Management has assigned you the admin Role. Your administrator account has been created successfully by the Super Administrator.
            </p>

            <!-- CREDENTIALS DETAILS CARD -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate;">
              <tr>
                <td style="padding: 20px 24px;">
                  
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    
                    <!-- Admin Email -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Email Address
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; font-weight: 600;">
                        ${adminEmail}
                      </td>
                    </tr>

                    <!-- Temporary Password -->
                    <tr>
                      <td class="detail-row detail-label" style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Temporary Password
                      </td>
                      <td class="detail-row detail-value" align="right" style="padding: 12px 0; color: #dc2626; font-size: 16px; font-family: monospace, monospace; font-weight: 700;">
                        ${temporaryPassword}
                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>

            <!-- CTA BUTTON -->
            <div style="text-align: center; margin-top: 36px;">
              <a href="${loginUrl}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);">
                Login to Admin Portal
              </a>
            </div>

            <!-- IMPORTANT NOTE BOX -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 36px; background-color: #fffbebf5; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="margin: 0; font-size: 13px; line-height: 22px; color: #78350f;">
                    🔒 <strong>Security Warning:</strong> For security reasons, please login using the credentials above and change your password immediately.
                    <br /><br />
                    If you were not expecting this account, please contact the Super Administrator immediately.
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
              Retail Donation Management System
            </p>
            <p style="color: #64748b; margin: 12px 0 0 0; font-size: 11px; line-height: 16px;">
              This is an automated email from SpacECE. Please do not reply to this email.
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
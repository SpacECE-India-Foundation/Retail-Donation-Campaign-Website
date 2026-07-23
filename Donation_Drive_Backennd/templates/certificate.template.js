/**
 * Generate HTML certificate template with donor and campaign details
 * @param {Object} certificateData - Certificate data
 * @param {string} certificateData.donorName - Name of the donor
 * @param {string} certificateData.campaignName - Name of the campaign
 * @param {number} certificateData.amount - Donation amount
 * @param {string} certificateData.donationDate - Date of donation (formatted)
 * @param {string} certificateData.qrCodeDataUri - QR code image as data URI
 * @param {string} certificateData.verificationUrl - URL for certificate verification
 * @param {string} certificateData.certificateId - Unique certificate ID
 * @returns {string} - HTML string for certificate
 */
export const certificateTemplate = (certificateData) => {
  const {
    donorName,
    campaignName,
    amount,
    donationDate,
    qrCodeDataUri,
    verificationUrl,
    certificateId,
  } = certificateData;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appreciation Certificate</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @page {
          size: A4 landscape;
          margin: 0;
        }

        html,
        body {
          width: 11.69in;
          height: 8.27in;
          margin: 0;
          padding: 0;
          font-family: 'Georgia', serif;
          background: #f5f5f5;
        }

        .certificate-container {
          width: 100%;
          height: 100%;
          padding: 60px;
          background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
          border: 3px solid #2c3e50;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .certificate-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #e74c3c, #3498db, #2ecc71);
        }

        .certificate-content {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .logo-section {
          margin-bottom: 30px;
        }

        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
          letter-spacing: 2px;
        }

        .logo-tagline {
          font-size: 12px;
          color: #7f8c8d;
          margin-top: 5px;
          font-style: italic;
        }

        .certificate-title {
          font-size: 42px;
          font-weight: bold;
          color: #e74c3c;
          margin: 30px 0;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .certificate-subtitle {
          font-size: 16px;
          color: #34495e;
          margin-bottom: 40px;
          font-style: italic;
        }

        .certificate-body {
          margin: 40px 0;
          line-height: 1.8;
        }

        .certificate-body p {
          font-size: 14px;
          color: #2c3e50;
          margin: 15px 0;
        }

        .donor-name {
          font-size: 28px;
          font-weight: bold;
          color: #2c3e50;
          margin: 20px 0;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }

        .campaign-info {
          background: #ecf0f1;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #3498db;
        }

        .info-row {
          display: flex;
          justify-content: space-around;
          margin: 10px 0;
          font-size: 14px;
        }

        .info-label {
          font-weight: bold;
          color: #34495e;
          min-width: 100px;
        }

        .info-value {
          color: #2c3e50;
          font-weight: 600;
        }

        .verification-section {
          margin: 40px 0;
          padding: 20px;
          background: #f0f7ff;
          border-radius: 8px;
          border: 2px dashed #3498db;
        }

        .qr-code {
          margin: 20px 0;
        }

        .qr-code img {
          width: 150px;
          height: 150px;
          border: 2px solid #3498db;
          padding: 5px;
          background: white;
        }

        .verification-text {
          font-size: 11px;
          color: #7f8c8d;
          margin-top: 10px;
          word-break: break-all;
        }

        .certificate-footer {
          margin-top: 50px;
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
        }

        .signature-box {
          text-align: center;
          min-width: 150px;
        }

        .signature-line {
          border-top: 2px solid #2c3e50;
          width: 120px;
          margin: 40px auto 5px;
        }

        .signature-name {
          font-size: 12px;
          font-weight: bold;
          color: #2c3e50;
        }

        .signature-title {
          font-size: 10px;
          color: #7f8c8d;
          font-style: italic;
        }

        .certificate-id {
          font-size: 9px;
          color: #95a5a6;
          margin-top: 30px;
          text-align: center;
        }

        .footer-text {
          font-size: 11px;
          color: #7f8c8d;
          margin-top: 20px;
          text-align: center;
          font-style: italic;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .certificate-container {
            margin: 0;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate-container">
        <div class="certificate-content">
          <!-- Logo Section -->
          <div class="logo-section">
            <div class="logo-text">SPACECE INDIA FOUNDATION</div>
            <div class="logo-tagline">Supporting Children & Community Education</div>
          </div>

          <!-- Certificate Title -->
          <div class="certificate-title">Certificate of Appreciation</div>

          <!-- Certificate Subtitle -->
          <div class="certificate-subtitle">This is to certify that</div>

          <!-- Donor Name -->
          <div class="donor-name">${donorName}</div>

          <!-- Certificate Body -->
          <div class="certificate-body">
            <p>has generously contributed to the cause of</p>
            <p style="font-size: 16px; font-weight: bold; color: #e74c3c;">
              ${campaignName}
            </p>
            <p>and demonstrated remarkable compassion and commitment to making a positive impact in our community.</p>
          </div>

          <!-- Campaign & Donation Info -->
          <div class="campaign-info">
            <div class="info-row">
              <div>
                <div class="info-label">Donation Amount</div>
                <div class="info-value">₹${amount.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div class="info-label">Date</div>
                <div class="info-value">${donationDate}</div>
              </div>
            </div>
          </div>

          <!-- Verification Section -->
          <div class="verification-section">
            <p style="font-size: 12px; color: #34495e; margin-bottom: 10px;">
              <strong>Certificate Verification</strong>
            </p>
            <div class="qr-code">
              <img src="${qrCodeDataUri}" alt="QR Code" />
            </div>
            <p style="font-size: 11px; color: #7f8c8d; margin-top: 10px;">
              Scan the QR code to verify certificate authenticity or visit:
            </p>
            <div class="verification-text">${verificationUrl}</div>
          </div>

          <!-- Closing Statement -->
          <p style="font-size: 13px; color: #34495e; margin-top: 30px; font-weight: bold;">
            With our heartfelt gratitude and best wishes
          </p>

          <!-- Signature Section -->
          <div class="certificate-footer">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-name">Authorized Signatory</div>
              <div class="signature-title">SPACECE INDIA FOUNDATION</div>
            </div>
          </div>

          <!-- Certificate ID -->
          <div class="certificate-id">
            Certificate ID: ${certificateId}
          </div>

          <!-- Footer -->
          <div class="footer-text">
            This certificate is issued in recognition of the generous contribution made to support our mission of providing quality education and care to underprivileged children. Every donation makes a real difference.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

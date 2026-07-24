// /**
//  * Generate HTML certificate template with donor and campaign details
//  * @param {Object} certificateData - Certificate data
//  * @param {string} certificateData.donorName - Name of the donor
//  * @param {string} certificateData.campaignName - Name of the campaign
//  * @param {string} certificateData.displayCertificateNo - Formatted Certificate Number
//  * @param {number} certificateData.amount - Donation amount
//  * @param {string} certificateData.donationDate - Date of donation (formatted)
//  * @param {string} certificateData.qrCodeDataUri - QR code image as data URI
//  * @param {string} certificateData.verificationUrl - URL for certificate verification
//  * @returns {string} - HTML string for certificate
//  */
// import fs from "fs";
// import path from "path";

// const logo = fs.readFileSync(
//     path.join(process.cwd(), "assets", "spaceecelogo.png")
// );

// const logoBase64 = `data:image/png;base64,${logo.toString("base64")}`;
// export const certificateTemplate = (certificateData) => {
//   const {
//     donorName,
//     campaignName,
//     displayCertificateNo,
//     amount,
//     donationDate,
//     qrCodeDataUri,
//     verificationUrl,
//   } = certificateData;

  

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <title>SpaceECE Donation Certificate</title>

// <style>
//   * {
//     margin: 0;
//     padding: 0;
//     box-sizing: border-box;
//   }

//   @page {
//     size: A4 landscape;
//     margin: 0;
//   }

//   html, body {
//     width: 297mm;
//     height: 210mm;
//     background: #e8ecef;
//     font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
//     -webkit-print-color-adjust: exact;
//     print-color-adjust: exact;
//   }

//   body {
//     display: flex;
//     justify-content: center;
//     align-items: center;
//   }

//   .certificate {
//     position: relative;
//     width: 297mm;
//     height: 210mm;
//     background: #ffffff;
//     overflow: hidden;
//     padding: 12mm;
//   }

//   /* Decorative Borders */
//   .outer-border {
//     position: absolute;
//     inset: 8mm;
//     border: 3px solid #d7bb6a;
//     pointer-events: none;
//     z-index: 2;
//   }

//   .inner-border {
//     position: absolute;
//     inset: 10mm;
//     border: 1px solid #e2d19d;
//     pointer-events: none;
//     z-index: 2;
//   }

//   /* Decorative Shapes */
//   .top-blue {
//     position: absolute;
//     top: 0;
//     right: 0;
//     width: 220px;
//     height: 85px;
//     background: #123d73;
//     clip-path: polygon(35% 0, 100% 0, 100% 100%, 0 100%);
//     z-index: 1;
//   }

//   .bottom-blue {
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     width: 220px;
//     height: 85px;
//     background: #123d73;
//     clip-path: polygon(0 0, 100% 0, 65% 100%, 0 100%);
//     z-index: 1;
//   }

//   .orange-strip {
//     position: absolute;
//     top: 0;
//     left: 0;
//     width: 240px;
//     height: 12px;
//     background: #efb443;
//     z-index: 1;
//   }

//   .watermark {
//     position: absolute;
//     inset: 0;
//     background-image: radial-gradient(circle, #cecece 1.5px, transparent 1.5px);
//     background-size: 40px 40px;
//     opacity: 0.12;
//     pointer-events: none;
//     z-index: 0;
//   }

//   /* Main Content Layout */
//   .content {
//     position: relative;
//     z-index: 3;
//     height: 100%;
//     display: flex;
//     flex-direction: column;
//     justify-content: space-between;
//     padding: 10px 25px;
//   }

//   /* Header Section */
//   .header {
//     text-align: center;
//     margin-top: 5px;
//   }

//   .logo-title {
//     font-size: 22px;
//     color: #123d73;
//     font-weight: 800;
//     letter-spacing: 1.5px;
//     text-transform: uppercase;
//   }

//   .logo-sub {
//     margin-top: 2px;
//     color: #666;
//     font-size: 11px;
//     letter-spacing: 0.5px;
//     font-weight: 600;
//   }

//   .title {
//     margin-top: 10px;
//     text-align: center;
//   }

//   .title h1 {
//     color: #123d73;
//     font-size: 38px;
//     font-weight: 900;
//     letter-spacing: 2px;
//     text-transform: uppercase;
//     line-height: 1;
//   }

//   .subtitle {
//     margin-top: 6px;
//     font-size: 15px;
//     color: #555;
//     text-align: center;
//     font-weight: 500;
//   }

//   .donor {
//     text-align: center;
//     margin: 8px 0;
//     font-size: 40px;
//     font-family: Georgia, 'Times New Roman', serif;
//     font-style: italic;
//     font-weight: bold;
//     color: #111111;
//     line-height: 1.2;
//     border-bottom: 2px solid #efb443;
//     display: inline-block;
//     padding: 0 30px 4px 30px;
//   }

//   .donor-container {
//     text-align: center;
//   }

//   .appreciation-message {
//     font-size: 13.5px;
//     color: #444;
//     line-height: 1.5;
//     text-align: center;
//     max-w: 800px;
//     margin: 6px auto 14px auto;
//   }

//   /* Details Wrapper (QR Code + Info Grid) */
//   .details-wrapper {
//     display: flex;
//     align-items: flex-start;
//     gap: 20px;
//     margin-bottom: 10px;
//   }

//   /* QR Box */
//   .left-column {
//     width: 170px;
//     shrink: 0;
//   }

//   .qr-box {
//     background: #fffdf8;
//     border: 2px solid #dcb05b;
//     border-radius: 12px;
//     padding: 12px;
//     text-align: center;
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
//   }

//   .qr-heading {
//     font-size: 13px;
//     font-weight: 700;
//     color: #123d73;
//     margin-bottom: 8px;
//     text-transform: uppercase;
//     letter-spacing: 0.5px;
//   }

//   .qr-image {
//     width: 120px;
//     height: 120px;
//     margin: 0 auto;
//     background: #ffffff;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     border: 1px solid #e0e0e0;
//     padding: 4px;
//     border-radius: 6px;
//   }

//   .qr-image img {
//     width: 100%;
//     height: 100%;
//     object-fit: contain;
//   }

//   .scan-text {
//     margin-top: 6px;
//     font-size: 10.5px;
//     color: #666;
//     font-weight: 600;
//   }

//   /* Information Grid */
//   .right-column {
//     flex: 1;
//   }

//   .info-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 12px;
//   }

//   .info-card {
//     background: #ffffff;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     padding: 10px 14px;
//     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
//   }

//   .card-campaign { border-left: 6px solid #123d73; }
//   .card-date { border-left: 6px solid #f0a636; }
//   .card-amount { border-left: 6px solid #2f9e44; }
//   .card-number { border-left: 6px solid #b7791f; }

//   .card-label {
//     color: #718096;
//     font-size: 10px;
//     text-transform: uppercase;
//     letter-spacing: 0.8px;
//     font-weight: 700;
//     margin-bottom: 3px;
//   }

//   .card-value {
//     font-size: 16px;
//     color: #1a202c;
//     font-weight: 700;
//     white-space: nowrap;
//     overflow: hidden;
//     text-overflow: ellipsis;
//   }

//   .amount-value {
//     color: #2f9e44;
//     font-size: 20px;
//     font-weight: 800;
//   }

//   /* Verification Callout */
//   .auth-callout {
//     margin-top: 10px;
//     padding: 8px 14px;
//     background: #fffdf5;
//     border-left: 4px solid #d4af37;
//     border-radius: 6px;
//     border-top: 1px solid #f3ebd0;
//     border-right: 1px solid #f3ebd0;
//     border-bottom: 1px solid #f3ebd0;
//   }

//   .auth-title {
//     font-weight: 700;
//     font-size: 12px;
//     color: #123d73;
//     margin-bottom: 2px;
//   }

//   .auth-desc {
//     font-size: 10.5px;
//     color: #555;
//     line-height: 1.4;
//   }

//   /* Footer & Signatures */
//   .footer-section {
//     margin-top: 5px;
//   }

//   .signature-row {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-end;
//     margin-bottom: 8px;
//   }

//   .url-block {
//     width: 60%;
//   }

//   .url-label {
//     font-size: 10px;
//     color: #718096;
//     text-transform: uppercase;
//     font-weight: 600;
//     margin-bottom: 2px;
//   }

//   .url-value {
//     color: #123d73;
//     font-size: 11px;
//     font-weight: 600;
//     word-break: break-all;
//   }

//   .signature-block {
//     width: 200px;
//     text-align: center;
//   }

//   .sig-handwritten {
//     font-family: 'Brush Script MT', cursive, sans-serif;
//     font-size: 26px;
//     color: #111;
//     margin-bottom: 2px;
//     line-height: 1;
//   }

//   .sig-line {
//     border-top: 1.5px solid #2d3748;
//     margin-bottom: 4px;
//   }

//   .sig-title {
//     font-size: 12px;
//     font-weight: 700;
//     color: #123d73;
//   }

//   .sig-org {
//     font-size: 10px;
//     color: #718096;
//   }

//   /* Copyright & Legal */
//   .legal-footer {
//     padding-top: 6px;
//     border-top: 1px solid #e2d19d;
//     text-align: center;
//   }

//   .legal-text {
//     font-size: 9.5px;
//     color: #718096;
//     line-height: 1.3;
//   }

//   .copyright {
//     margin-top: 2px;
//     font-size: 9px;
//     color: #a0aec0;
//     letter-spacing: 0.5px;
//   }
// </style>
// </head>

// <body>

// <div class="certificate">
//   <div class="outer-border"></div>
//   <div class="inner-border"></div>
//   <div class="top-blue"></div>
//   <div class="bottom-blue"></div>
//   <div class="orange-strip"></div>
//   <div class="watermark"></div>

//   <div class="content">

//     <!-- Header Section -->
//     <div class="header">
//       <div class="logo-title">SpaceECE India Foundation</div>
//       <div class="logo-sub">Education & Community Development Initiatives</div>
      
//       <div class="title">
//         <h1>Certificate of Donation</h1>
//       </div>

//       <div class="subtitle">
//         This is to proudly certify and acknowledge the generous contribution of
//       </div>

//       <div class="donor-container">
//         <div class="donor">${donorName}</div>
//       </div>
//     </div>

//     <!-- Appreciation Message -->
//     <div class="appreciation-message">
//       Thank you for supporting our mission of empowering children and communities through quality early education. Your contribution helps create a brighter, sustainable future for those who need it most.
//     </div>

//     <!-- Details Grid & QR -->
//     <div class="details-wrapper">
      
//       <!-- QR Column -->
//       <div class="left-column">
//         <div class="qr-box">
//           <div class="qr-heading">Verification Code</div>
//           <div class="qr-image">
//             <img src="${qrCodeDataUri}" alt="Verification QR Code" />
//           </div>
//           <div class="scan-text">Scan to Verify</div>
//         </div>
//       </div>

//       <!-- Info Grid Column -->
//       <div class="right-column">
//         <div class="info-grid">
          
//           <!-- Campaign Card -->
//           <div class="info-card card-campaign">
//             <div class="card-label">Campaign Name</div>
//             <div class="card-value" title="${campaignName}">${campaignName}</div>
//           </div>

//           <!-- Date Card -->
//           <div class="info-card card-date">
//             <div class="card-label">Donation Date</div>
//             <div class="card-value">${donationDate}</div>
//           </div>

//           <!-- Amount Card -->
//           <div class="info-card card-amount">
//             <div class="card-label">Donation Amount</div>
//             <div class="card-value amount-value">₹${amount.toLocaleString("en-IN")}</div>
//           </div>

//           <!-- Certificate No Card -->
//           <div class="info-card card-number">
//             <div class="card-label">Certificate Number</div>
//             <div class="card-value">${displayCertificateNo}</div>
//           </div>

//         </div>

//         <!-- Auth Callout -->
//         <div class="auth-callout">
//           <div class="auth-title">Certificate Authentication</div>
//           <div class="auth-desc">
//             Digitally issued by <b>SpaceECE India Foundation</b>. Authenticity can be verified at any time by scanning the QR code or visiting our verification web portal.
//           </div>
//         </div>
//       </div>

//     </div>

//     <!-- Footer & Signature Block -->
//     <div class="footer-section">
//       <div class="signature-row">
        
//         <!-- Online Verification URL -->
//         <div class="url-block">
//           <div class="url-label">Verify Online</div>
//           <div class="url-value">${verificationUrl}</div>
//         </div>

//         <!-- Signature -->
//         <div class="signature-block">
//           <div class="sig-handwritten">SpaceECE Director</div>
//           <div class="sig-line"></div>
//           <div class="sig-title">Authorized Director</div>
//           <div class="sig-org">SpaceECE India Foundation</div>
//         </div>

//       </div>

//       <!-- Copyright Footer -->
//       <div class="legal-footer">
//         <div class="legal-text">
//           This is an electronically generated certificate. Every contribution directly empowers our early childhood education and care programs.
//         </div>
//         <div class="copyright">
//           © ${new Date().getFullYear()} SpaceECE India Foundation • All Rights Reserved
//         </div>
//       </div>
//     </div>

//   </div> <!-- /content -->
// </div> <!-- /certificate -->

// </body>
// </html>
//   `;
// };

/**
 * Generate HTML certificate template with donor and campaign details
 * @param {Object} certificateData - Certificate data
 * @param {string} certificateData.donorName - Name of the donor
 * @param {string} certificateData.campaignName - Name of the campaign
 * @param {string} certificateData.displayCertificateNo - Formatted Certificate Number
 * @param {number} certificateData.amount - Donation amount
 * @param {string} certificateData.donationDate - Date of donation (formatted)
 * @param {string} certificateData.qrCodeDataUri - QR code image as data URI
 * @param {string} certificateData.verificationUrl - URL for certificate verification
 * @returns {string} - HTML string for certificate
 */
import fs from "fs";
import path from "path";

const logo = fs.readFileSync(
    path.join(process.cwd(), "assets", "spaceecelogo.png")
);

const logoBase64 = `data:image/png;base64,${logo.toString("base64")}`;

export const certificateTemplate = (certificateData) => {
  const {
    donorName,
    campaignName,
    displayCertificateNo,
    amount,
    donationDate,
    qrCodeDataUri,
    verificationUrl,
  } = certificateData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SpaceECE Donation Certificate</title>

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

  html, body {
    width: 297mm;
    height: 210mm;
    background: #e8ecef;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .certificate {
    position: relative;
    width: 297mm;
    height: 210mm;
    background: #ffffff;
    overflow: hidden;
    padding: 12mm;
  }

  /* Decorative Borders - Brand Amber & Soft Cream */
  .outer-border {
    position: absolute;
    inset: 8mm;
    border: 3px solid #f5a623;
    pointer-events: none;
    z-index: 2;
  }

  .inner-border {
    position: absolute;
    inset: 10mm;
    border: 1px solid #fde68a;
    pointer-events: none;
    z-index: 2;
  }

  /* Decorative Shapes - Brand Charcoal & Amber Orange */
  .top-blue {
    position: absolute;
    top: 0;
    right: 0;
    width: 220px;
    height: 85px;
    background: #1a1a1a;
    clip-path: polygon(35% 0, 100% 0, 100% 100%, 0 100%);
    z-index: 1;
  }

  .bottom-blue {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 220px;
    height: 85px;
    background: #1a1a1a;
    clip-path: polygon(0 0, 100% 0, 65% 100%, 0 100%);
    z-index: 1;
  }

  .orange-strip {
    position: absolute;
    top: 0;
    left: 0;
    width: 240px;
    height: 12px;
    background: #f5a623;
    z-index: 1;
  }

  .watermark {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, #cecece 1.5px, transparent 1.5px);
    background-size: 40px 40px;
    opacity: 0.12;
    pointer-events: none;
    z-index: 0;
  }

  /* Main Content Layout */
  .content {
    position: relative;
    z-index: 3;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 25px;
  }

  /* Header Section */
  .header {
    text-align: center;
    margin-top: 2px;
  }

  .brand-logo {
    height: 55px;
    width: auto;
    margin: 0 auto 6px auto;
    display: block;
    object-fit: contain;
  }

  .logo-title {
    font-size: 20px;
    color: #1a1a1a;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .logo-sub {
    margin-top: 2px;
    color: #656565;
    font-size: 11px;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .title {
    margin-top: 8px;
    text-align: center;
  }

  .title h1 {
    color: #1a1a1a;
    font-size: 36px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    line-height: 1;
  }

  .subtitle {
    margin-top: 6px;
    font-size: 15px;
    color: #555555;
    text-align: center;
    font-weight: 500;
  }

  .donor {
    text-align: center;
    margin: 6px 0;
    font-size: 38px;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-weight: bold;
    color: #111111;
    line-height: 1.2;
    border-bottom: 2.5px solid #f5a623;
    display: inline-block;
    padding: 0 30px 4px 30px;
  }

  .donor-container {
    text-align: center;
  }

  .appreciation-message {
    font-size: 13.5px;
    color: #444444;
    line-height: 1.5;
    text-align: center;
    max-width: 800px;
    margin: 4px auto 12px auto;
  }

  /* Details Wrapper (QR Code + Info Grid) */
  .details-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 8px;
  }

  /* QR Box */
  .left-column {
    width: 170px;
    flex-shrink: 0;
  }

  .qr-box {
    background: #fffdf8;
    border: 2px solid #f5a623;
    border-radius: 12px;
    padding: 12px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(245, 166, 35, 0.08);
  }

  .qr-heading {
    font-size: 13px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .qr-image {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    background: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #e0e0e0;
    padding: 4px;
    border-radius: 6px;
  }

  .qr-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .scan-text {
    margin-top: 6px;
    font-size: 10.5px;
    color: #656565;
    font-weight: 600;
  }

  /* Information Grid */
  .right-column {
    flex: 1;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .info-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  .card-campaign { border-left: 6px solid #1a1a1a; }
  .card-date { border-left: 6px solid #f5a623; }
  .card-amount { border-left: 6px solid #d97706; }
  .card-number { border-left: 6px solid #4b5563; }

  .card-label {
    color: #656565;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 700;
    margin-bottom: 3px;
  }

  .card-value {
    font-size: 16px;
    color: #1a1a1a;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .amount-value {
    color: #d97706;
    font-size: 20px;
    font-weight: 800;
  }

  /* Verification Callout */
  .auth-callout {
    margin-top: 10px;
    padding: 8px 14px;
    background: #fffdf5;
    border-left: 4px solid #f5a623;
    border-radius: 6px;
    border-top: 1px solid #fef3c7;
    border-right: 1px solid #fef3c7;
    border-bottom: 1px solid #fef3c7;
  }

  .auth-title {
    font-weight: 700;
    font-size: 12px;
    color: #1a1a1a;
    margin-bottom: 2px;
  }

  .auth-desc {
    font-size: 10.5px;
    color: #555555;
    line-height: 1.4;
  }

  /* Footer & Signatures */
  .footer-section {
    margin-top: 5px;
  }

  .signature-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 8px;
  }

  .url-block {
    width: 60%;
  }

  .url-label {
    font-size: 10px;
    color: #656565;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .url-value {
    color: #d97706;
    font-size: 11px;
    font-weight: 600;
    word-break: break-all;
  }

  .signature-block {
    width: 200px;
    text-align: center;
  }

  .sig-handwritten {
    font-family: 'Brush Script MT', cursive, sans-serif;
    font-size: 26px;
    color: #111111;
    margin-bottom: 2px;
    line-height: 1;
  }

  .sig-line {
    border-top: 1.5px solid #1a1a1a;
    margin-bottom: 4px;
  }

  .sig-title {
    font-size: 12px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .sig-org {
    font-size: 10px;
    color: #656565;
  }

  /* Copyright & Legal */
  .legal-footer {
    padding-top: 6px;
    border-top: 1px solid #fde68a;
    text-align: center;
  }

  .legal-text {
    font-size: 9.5px;
    color: #656565;
    line-height: 1.3;
  }

  .copyright {
    margin-top: 2px;
    font-size: 9px;
    color: #9ca3af;
    letter-spacing: 0.5px;
  }
</style>
</head>

<body>

<div class="certificate">
  <div class="outer-border"></div>
  <div class="inner-border"></div>
  <div class="top-blue"></div>
  <div class="bottom-blue"></div>
  <div class="orange-strip"></div>
  <div class="watermark"></div>

  <div class="content">

    <!-- Header Section -->
    <div class="header">
      <img src="${logoBase64}" alt="SpaceECE Logo" class="brand-logo" />
      <div class="logo-title">SpaceECE India Foundation</div>
      <div class="logo-sub">Education & Community Development Initiatives</div>
      
      <div class="title">
        <h1>Certificate of Donation</h1>
      </div>

      <div class="subtitle">
        This is to proudly certify and acknowledge the generous contribution of
      </div>

      <div class="donor-container">
        <div class="donor">${donorName}</div>
      </div>
    </div>

    <!-- Appreciation Message -->
    <div class="appreciation-message">
      Thank you for supporting our mission of empowering children and communities through quality early education. Your contribution helps create a brighter, sustainable future for those who need it most.
    </div>

    <!-- Details Grid & QR -->
    <div class="details-wrapper">
      
      <!-- QR Column -->
      <div class="left-column">
        <div class="qr-box">
          <div class="qr-heading">Verification Code</div>
          <div class="qr-image">
            <img src="${qrCodeDataUri}" alt="Verification QR Code" />
          </div>
          <div class="scan-text">Scan to Verify</div>
        </div>
      </div>

      <!-- Info Grid Column -->
      <div class="right-column">
        <div class="info-grid">
          
          <!-- Campaign Card -->
          <div class="info-card card-campaign">
            <div class="card-label">Campaign Name</div>
            <div class="card-value" title="${campaignName}">${campaignName}</div>
          </div>

          <!-- Date Card -->
          <div class="info-card card-date">
            <div class="card-label">Donation Date</div>
            <div class="card-value">${donationDate}</div>
          </div>

          <!-- Amount Card -->
          <div class="info-card card-amount">
            <div class="card-label">Donation Amount</div>
            <div class="card-value amount-value">₹${amount.toLocaleString("en-IN")}</div>
          </div>

          <!-- Certificate No Card -->
          <div class="info-card card-number">
            <div class="card-label">Certificate Number</div>
            <div class="card-value">${displayCertificateNo}</div>
          </div>

        </div>

        <!-- Auth Callout -->
        <div class="auth-callout">
          <div class="auth-title">Certificate Authentication</div>
          <div class="auth-desc">
            Digitally issued by <b>SpaceECE India Foundation</b>. Authenticity can be verified at any time by scanning the QR code or visiting our verification web portal.
          </div>
        </div>
      </div>

    </div>

    <!-- Footer & Signature Block -->
    <div class="footer-section">
      <div class="signature-row">
        
        <!-- Online Verification URL -->
        <div class="url-block">
          <div class="url-label">Verify Online</div>
          <div class="url-value">${verificationUrl}</div>
        </div>

        <!-- Signature -->
        <div class="signature-block">
          <div class="sig-handwritten">SpaceECE Director</div>
          <div class="sig-line"></div>
          <div class="sig-title">Authorized Director</div>
          <div class="sig-org">SpaceECE India Foundation</div>
        </div>

      </div>

      <!-- Copyright Footer -->
      <div class="legal-footer">
        <div class="legal-text">
          This is an electronically generated certificate. Every contribution directly empowers our early childhood education and care programs.
        </div>
        <div class="copyright">
          © ${new Date().getFullYear()} SpaceECE India Foundation • All Rights Reserved
        </div>
      </div>
    </div>

  </div> <!-- /content -->
</div> <!-- /certificate -->

</body>
</html>
  `;
};
// import QRCode from "qrcode";

// /**
//  * Generate QR code as Data URI for certificate embedding
//  * @param {string} certificateId - Unique certificate identifier
//  * @param {string} baseUrl - Base URL of the application (e.g., http://localhost:5000)
//  * @returns {Promise<string>} - Data URI of QR code image
//  */
// export const generateQRCode = async (certificateId, baseUrl) => {
//   try {
//     const verificationUrl = `${baseUrl}/api/verify-certificate/${certificateId}`;
    
//     const qrCodeDataUri = await QRCode.toDataURL(verificationUrl, {
//       errorCorrectionLevel: "H",
//       type: "image/png",
//       width: 200,
//       margin: 1,
//       color: {
//         dark: "#000000",
//         light: "#FFFFFF",
//       },
//     });

//     return qrCodeDataUri;
//   } catch (error) {
//     console.error("Error generating QR code:", error.message);
//     throw new Error("Failed to generate QR code: " + error.message);
//   }
// };

// /**
//  * Validate certificate ID format (UUID v4)
//  * @param {string} certificateId - Certificate ID to validate
//  * @returns {boolean}
//  */
// export const isValidCertificateId = (certificateId) => {
//   const uuidRegex =
//     /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//   return uuidRegex.test(certificateId);
// };
import QRCode from "qrcode";

/**
 * Generate QR code from any URL
 * @param {string} verificationUrl - Frontend verification URL
 * @returns {Promise<string>}
 */
export const generateQRCode = async (verificationUrl) => {
  try {
    const qrCodeDataUri = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCodeDataUri;
  } catch (error) {
    console.error("Error generating QR code:", error.message);
    throw new Error("Failed to generate QR code: " + error.message);
  }
};
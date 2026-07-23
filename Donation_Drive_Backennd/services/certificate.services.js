import { v4 as uuidv4 } from "uuid";
import puppeteer from "puppeteer";
import { certificateTemplate } from "../templates/certificate.template.js";
import { generateQRCode} from "../utils/qrcode.utils.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import fs from "fs";
import path from "path";
import generateDisplayCertificateNo from "../utils/generateCertificateNumber.utils.js";

class CertificateService {
  constructor() {
    this.pdfOptions = {
      format: "A4",
      orientation: "landscape",
      border: "0",
      timeout: 30000,
      type: "pdf",
    };

    this.tempDir = path.join(process.cwd(), "temp-certificates");
    this.ensureTempDir();
  }

  /**
   * Ensure temp directory exists for storing PDFs before upload
   */
  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate a complete certificate with QR code, render to PDF, and upload
   * @param {Object} certData - Certificate data
   * @param {string} certData.donorName - Donor name
   * @param {string} certData.campaignName - Campaign name
   * @param {number} certData.amount - Donation amount
   * @param {Date} certData.donationDate - Donation date
   * @returns {Promise<Object>} - Object with certificateId and certificateUrl
   */
  async generateAndUploadCertificate(certData) {
    let tempFilePath = null;

    try {
      // Step 1: Generate unique certificate ID (UUID v4)
      const certificateId = uuidv4();
      const displayCertificateNo = generateDisplayCertificateNo();
      const baseUrl = process.env.CLIENT_ADDRESS || "http://localhost:5000";
      const verificationUrl = `${process.env.CLIENT_ADDRESS}/verify/${certificateId}`;;
      console.log('certificateId',certificateId)

      // Step 2: Generate QR code as data URI
      const qrCodeDataUri = await generateQRCode(verificationUrl);


      // Step 3: Prepare certificate template data
      const certificateData = {
        donorName: certData.donorName,
        campaignName: certData.campaignName,
         displayCertificateNo,
        amount: certData.amount,
        donationDate: this._formatDate(certData.donationDate),
        qrCodeDataUri,
        verificationUrl,
        certificateId,
      };

      // Step 4: Render HTML template
      const htmlContent = certificateTemplate(certificateData);

      // Step 5: Convert HTML to PDF
      const pdfBuffer = await this._htmlToPdf(htmlContent);

      // Step 6: Save PDF to temp location
      tempFilePath = path.join(this.tempDir, `${certificateId}.pdf`);
      fs.writeFileSync(tempFilePath, pdfBuffer);

      // Step 7: Upload to Cloudinary as raw file
      const cloudinaryResult = await uploadBufferToCloudinary(
        pdfBuffer,
        `certificates/${certificateId}`,
        "raw"
      );

      if (!cloudinaryResult.secure_url) {
        throw new Error("Failed to get certificate URL from Cloudinary");
      }

      // Step 8: Return certificate metadata
      return {
        certificateId,
        certificateUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        verificationUrl,
         displayCertificateNo,
      };
    } catch (error) {
      console.error("Error generating certificate:", error.message);
      throw new ApiError(
        500,
        "Failed to generate certificate: " + error.message
      );
    } finally {
      // Step 9: Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.warn("Failed to delete temp certificate file:", cleanupError.message);
        }
      }
    }
  }

  /**
   * Convert HTML string to PDF buffer
   * @param {string} htmlContent - HTML content
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async _htmlToPdf(htmlContent) {
    let browser;
    try {
      browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: this.pdfOptions.format || "A4",
        landscape: this.pdfOptions.orientation === "landscape",
        printBackground: true,
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
        preferCSSPageSize: true,
      });

      return pdfBuffer;
    } catch (err) {
      throw new Error(`PDF generation failed: ${err.message}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // ignore
        }
      }
    }
  }

  /**
   * Format date to readable format
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  _formatDate(date) {
    const d = new Date(date);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return d.toLocaleDateString("en-IN", options);
  }

  /**
   * Delete certificate from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<void>}
   */
  async deleteCertificate(publicId) {
    try {
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    } catch (error) {
      console.warn("Failed to delete certificate from Cloudinary:", error.message);
      // Don't throw - certificate deletion should not block donation updates
    }
  }

  /**
   * Validate certificate ID format
   * @param {string} certificateId - Certificate ID to validate
   * @returns {boolean}
   */
  isValidCertificateId(certificateId) {
    return isValidCertificateId(certificateId);
  }

  /**
   * Clean up old temp files (maintenance utility)
   * @param {number} maxAgeMinutes - Delete files older than this (default: 60 minutes)
   */
  async cleanupOldTempFiles(maxAgeMinutes = 60) {
    try {
      const now = Date.now();
      const maxAge = maxAgeMinutes * 60 * 1000;

      if (!fs.existsSync(this.tempDir)) {
        return;
      }

      const files = fs.readdirSync(this.tempDir);

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old temp file: ${file}`);
        }
      }
    } catch (error) {
      console.warn("Error cleaning up temp files:", error.message);
    }
  }
}

// Export singleton instance
export default new CertificateService();

// import { v4 as uuidv4 } from "uuid";
// import puppeteer from "puppeteer";
// import fs from "fs";
// import path from "path";
// import { eightyGCertificateTemplate } from "../templates/eightyGCertificate.template.js";
// import {uploadBufferToCloudinary,deleteFromCloudinary} from "../utils/cloudinary.utils.js";
// import { ApiError } from "../utils/apiError.utils.js";
// import { eightyGCertificateNumber } from "../utils/eightyGCertificateNumberGenerator.utils.js";


// class EightyGCertificateService {

//     constructor() {
//         this.tempDir = path.join(
//             process.cwd(),
//             "temp-80g-certificates"
//         );

//         this.ensureTempDir();
//     }


//     ensureTempDir() {
//         if (!fs.existsSync(this.tempDir)) {
//             fs.mkdirSync(this.tempDir, { recursive: true });
//         }
//     }


//     async generateAndUploadCertificate(certData) {

//         let tempFilePath = null;

//         try {

//             const certificateId = uuidv4();
//             const certificateNumber = eightyGCertificateNumber()
//             const certificateData = {
//                 certificateId,
//                 certificateNumber,
//                 donorName: certData.donorName,
//                 panNumber: certData.panNumber,
//                 donationAmount: certData.donationAmount,
//                 donationDate:this._formatDate(certData.donationDate),
//                 organisationName:process.env.ORG_NAME,
//                 organisationRegistrationNumber:process.env.ORG_REGISTRATION_NUMBER,
//                 organisationAddress:process.env.ORG_ADDRESS,
//                 organisationPAN:process.env.ORG_PAN,
//                 eightyGNumber:process.env.ORG_80G_NUMBER,
//                 eightyGValidity:process.env.ORG_80G_VALIDITY,
//                 twelveABNumber:process.env.ORG_12AB_NUMBER,
//                 twelveABValidity:process.env.ORG_12AB_VALIDITY,
//                 authorisedSignatory:process.env.ORG_AUTHORISED_SIGNATORY,
//                 authorisedDesignation:process.env.ORG_AUTHORISED_DESIGNATION,
//                 contactEmail:process.env.ORG_CONTACT_EMAIL,
//                 contactPhone:process.env.ORG_CONTACT_PHONE
//             };
//             const htmlContent = eightyGCertificateTemplate(certificateData);
//             const pdfBuffer =await this._htmlToPdf(htmlContent);
//             tempFilePath = path.join(
//                 this.tempDir,
//                 `${certificateId}.pdf`
//             );
//             fs.writeFileSync(
//                 tempFilePath,
//                 pdfBuffer
//             );

//             const cloudinaryResult =
//                 await uploadBufferToCloudinary(
//                     pdfBuffer,
//                     `80g-certificates/${certificateId}`,
//                     "raw"
//                 );

//             if (!cloudinaryResult?.secure_url) {
//                 throw new Error(
//                     "Failed to get 80G certificate URL from Cloudinary"
//                 );
//             }

//             return {
//                 certificateId,
//                 certificateNumber,
//                 certificateUrl:cloudinaryResult.secure_url,
//                 publicId:cloudinaryResult.public_id,
//             };

//         } catch (error) {

//             console.error(
//                 "Error generating 80G certificate:",
//                 error.message
//             );

//             throw new ApiError(
//                 500,
//                 "Failed to generate 80G certificate: " +
//                 error.message
//             );

//         } finally {

//             if (
//                 tempFilePath &&
//                 fs.existsSync(tempFilePath)
//             ) {

//                 try {
//                     fs.unlinkSync(tempFilePath);
//                 } catch (cleanupError) {
//                     console.warn(
//                         "Failed to delete temporary 80G certificate:",
//                         cleanupError.message
//                     );
//                 }
//             }
//         }
//     }


//     async _htmlToPdf(htmlContent) {

//         let browser;

//         try {

//             browser = await puppeteer.launch({
//                 args: [
//                     "--no-sandbox",
//                     "--disable-setuid-sandbox"
//                 ]
//             });


//             const page =
//                 await browser.newPage();


//             await page.setContent(
//                 htmlContent,
//                 {
//                     waitUntil: "domcontentloaded",
//                     timeout: 30000,
//                 }
//             );


//             return await page.pdf({

//                 format: "A4",

//                 landscape: true,

//                 printBackground: true,

//                 margin: {
//                     top: "0px",
//                     right: "0px",
//                     bottom: "0px",
//                     left: "0px",
//                 },

//                 preferCSSPageSize: true,
//             });

//         } catch (error) {

//             throw new Error(
//                 `80G PDF generation failed: ${error.message}`
//             );

//         } finally {

//             if (browser) {
//                 try {
//                     await browser.close();
//                 } catch (error) {
//                     // ignore browser close error
//                 }
//             }
//         }
//     }


//     _formatDate(date) {

//         const d = new Date(date);

//         return d.toLocaleDateString(
//             "en-IN",
//             {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//             }
//         );
//     }


//     async deleteCertificate(publicId) {

//         try {

//             if (publicId) {
//                 await deleteFromCloudinary(
//                     publicId,
//                     "raw"
//                 );
//             }

//         } catch (error) {

//             console.warn(
//                 "Failed to delete 80G certificate:",
//                 error.message
//             );
//         }
//     }
// }


// export default new EightyGCertificateService();
import { v4 as uuidv4 } from "uuid";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { eightyGCertificateTemplate } from "../templates/eightyGCertificate.templates.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import { eightyGCertificateNumber } from "../utils/eightyGCertificateNumberGenerator.utils.js";

class EightyGCertificateService {

    constructor() {
        this.tempDir = path.join(
            process.cwd(),
            "temp-80g-certificates"
        );

        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // Helper to get Base64 Logo safely
    _getLogoBase64() {
        try {
            const logoPath = path.join(process.cwd(), "assets", "spacecelogo.png");
            if (fs.existsSync(logoPath)) {
                const logo = fs.readFileSync(logoPath);
                return `data:image/png;base64,${logo.toString("base64")}`;
            }
            return "";
        } catch (error) {
            console.warn("Failed to load local logo:", error.message);
            return "";
        }
    }

    async generateAndUploadCertificate(certData) {

        let tempFilePath = null;

        try {

            const certificateId = uuidv4();
            const certificateNumber = await eightyGCertificateNumber();
            const logoBase64 = this._getLogoBase64();

            const certificateData = {
                certificateId,
                certificateNumber,
                logoBase64,
                donorName: certData.donorName,
                panNumber: certData.panNumber,
                donationAmount: certData.donationAmount,
                donationDate: this._formatDate(certData.donationDate),
                organisationName: process.env.ORG_NAME,
                organisationRegistrationNumber: process.env.ORG_REGISTRATION_NUMBER,
                organisationAddress: process.env.ORG_ADDRESS,
                organisationPAN: process.env.ORG_PAN,
                eightyGNumber: process.env.ORG_80G_NUMBER,
                eightyGValidity: process.env.ORG_80G_VALIDITY,
                twelveABNumber: process.env.ORG_12AB_NUMBER,
                twelveABValidity: process.env.ORG_12AB_VALIDITY,
                authorisedSignatory: process.env.ORG_AUTHORISED_SIGNATORY,
                authorisedDesignation: process.env.ORG_AUTHORISED_DESIGNATION,
                contactEmail: process.env.ORG_CONTACT_EMAIL,
                contactPhone: process.env.ORG_CONTACT_PHONE
            };

            const htmlContent = eightyGCertificateTemplate(certificateData);
            const pdfBuffer = await this._htmlToPdf(htmlContent);

            tempFilePath = path.join(
                this.tempDir,
                `${certificateId}.pdf`
            );
            fs.writeFileSync(
                tempFilePath,
                pdfBuffer
            );

            const cloudinaryResult = await uploadBufferToCloudinary(
                pdfBuffer,
                `80g-certificates/${certificateId}`,
                "raw"
            );

            if (!cloudinaryResult?.secure_url) {
                throw new Error(
                    "Failed to get 80G certificate URL from Cloudinary"
                );
            }

            return {
                certificateId,
                certificateNumber,
                certificateUrl: cloudinaryResult.secure_url,
                publicId: cloudinaryResult.public_id,
            };

        } catch (error) {

            console.error(
                "Error generating 80G certificate:",
                error.message
            );

            throw new ApiError(
                500,
                "Failed to generate 80G certificate: " + error.message
            );

        } finally {

            if (
                tempFilePath &&
                fs.existsSync(tempFilePath)
            ) {
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (cleanupError) {
                    console.warn(
                        "Failed to delete temporary 80G certificate:",
                        cleanupError.message
                    );
                }
            }
        }
    }

    async _htmlToPdf(htmlContent) {

        let browser;

        try {

            browser = await puppeteer.launch({
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox"
                ]
            });

            const page = await browser.newPage();

            await page.setContent(
                htmlContent,
                {
                    waitUntil: "domcontentloaded",
                    timeout: 30000,
                }
            );

            return await page.pdf({
                format: "A4",
                landscape: true,
                printBackground: true,
                margin: {
                    top: "0px",
                    right: "0px",
                    bottom: "0px",
                    left: "0px",
                },
                preferCSSPageSize: true,
            });

        } catch (error) {

            throw new Error(
                `80G PDF generation failed: ${error.message}`
            );

        } finally {

            if (browser) {
                try {
                    await browser.close();
                } catch (error) {
                    // ignore browser close error
                }
            }
        }
    }

    _formatDate(date) {

        const d = new Date(date);

        return d.toLocaleDateString(
            "en-IN",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    }

    async deleteCertificate(publicId) {

        try {

            if (publicId) {
                await deleteFromCloudinary(
                    publicId,
                    "raw"
                );
            }

        } catch (error) {

            console.warn(
                "Failed to delete 80G certificate:",
                error.message
            );
        }
    }
}

export default new EightyGCertificateService();
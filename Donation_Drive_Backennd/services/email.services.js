// import nodemailer from "nodemailer";
// import { donationConfirmationTemplate } from "../templates/successfullDonationRegistration.template.js";
// import { donationVerifiedTemplate } from "../templates/donationVerified.template.js";
// import { donationRejectedTemplate } from "../templates/donationRejectionTemplate.js";
// import { resendDonationRequestTemplate } from "../templates/resendDonationRequest.template.js";
// import { adminAccountCreatedTemplate } from "../templates/adminCreation.templates.js";
// import { newCampaignNotificationTemplate } from "../templates/newCampaignNotification.template.js";
// import { campaignMilestoneUpdateTemplate } from "../templates/campaignMilestoneUpdate.template.js";

// class EmailService {
//     constructor() {
//         this.transporter = nodemailer.createTransport({
//             host: process.env.SMTP_HOST,
//             port: Number(process.env.SMTP_PORT),
//             secure: process.env.SMTP_SECURE === "true",
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASSWORD
//             }
//         });
//         this.transporter.verify(function (error, success) {
//     if (error) {
//         console.error("SMTP Verify Failed");
//         console.error(error);
//     } else {
//         console.log("SMTP Server Ready");
//     }
// });
//     }
//     async sendCampaignOwnershipTransferEmail({
//     adminName,
//     adminEmail,
//     transferredCampaigns,
//     transferType // "ASSIGNED" | "REMOVED"
// }) {

//     const campaignList = transferredCampaigns
//         .map((campaign, index) => `${index + 1}. ${campaign.campaignName}`)
//         .join("\n");

//     const isAssigned = transferType === "ASSIGNED";

//     const subject = isAssigned
//         ? "New Campaign Management Assigned"
//         : "Campaign Management Transferred";

//     const html = `
//         <div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; line-height:1.7;">
//             <h2>${isAssigned ? "Campaigns Assigned Successfully" : "Campaign Ownership Updated"}</h2>

//             <p>Hello <strong>${adminName}</strong>,</p>

//             <p>
//                 ${
//                     isAssigned
//                         ? "The following campaign(s) have been assigned to your account by the Super Admin. You are now responsible for managing them."
//                         : "The management of the following campaign(s) has been transferred to another administrator by the Super Admin."
//                 }
//             </p>

//             <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
//                 <h3>Campaigns</h3>

//                 <ul>
//                     ${transferredCampaigns
//                         .map(c => `<li>${c.campaignName}</li>`)
//                         .join("")}
//                 </ul>
//             </div>

//             <p>
//                 ${
//                     isAssigned
//                         ? "You can now access these campaigns from your Admin Dashboard."
//                         : "You will no longer be able to manage these campaigns from your account."
//                 }
//             </p>

//             <br>

//             <p>Regards,<br><strong>SpaceECE Administration Team</strong></p>

//         </div>
//     `;

//     const text = `
// Hello ${adminName},

// ${
//     isAssigned
//         ? "The following campaigns have been assigned to you:"
//         : "The following campaigns have been transferred from your account:"
// }

// ${campaignList}

// Regards,
// SpaceECE Team
// `;

//     return this.sendEmail({
//         to: adminEmail,
//         subject,
//         html,
//         text
//     });
// }
//     // async sendEmail({to, subject, html, text, attachments = []}) {
//     //     return await this.transporter.sendMail({
//     //         from: process.env.SMTP_FROM,
//     //         to,
//     //         subject,
//     //         text,
//     //         html,
//     //         attachments
//     //     });
//     // }
//     async sendEmail({ to, subject, html, text, attachments = [] }) {
//     try {
//         const info = await this.transporter.sendMail({
//             from: process.env.SMTP_FROM,
//             to,
//             subject,
//             text,
//             html,
//             attachments
//         });

//         // console.log(" Email sent successfully");
//         // console.log(info);

//         return info;

//     } catch (error) {
//         console.error("Email Error");
//         console.error(error);

//         throw error;
//     }
// }

//     async sendAdminAccountCreatedEmail({
//     adminName,
//     adminEmail,
//     temporaryPassword,
//     loginUrl
// }) {

//     const html = adminAccountCreatedTemplate({
//         adminName,
//         adminEmail,
//         temporaryPassword,
//         loginUrl
//     });

//     return this.sendEmail({
//         to: adminEmail,
//         subject: "Welcome to SpaceECE Admin Portal",
//         html,
//         text: `
// Your administrator account has been created successfully.

// Email: ${adminEmail}
// Temporary Password: ${temporaryPassword}

// Please login and change your password immediately.

// Login: ${loginUrl}
//         `
//     });
// }
// async send80GCertificateEmail({
//     donorName,
//     donorEmail,
//     donationAmount,
//     donationDate,
//     certificateNumber,
//     certificateUrl
// }) {

//     const html = `
//         <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; line-height: 1.7; color: #333;">

//             <h2 style="color: #b45309;">
//                 80G Donation Certificate
//             </h2>

//             <p>
//                 Dear <strong>${donorName}</strong>,
//             </p>

//             <p>
//                 Thank you for your valuable contribution to
//                 <strong>SpacECE India Foundation</strong>.
//             </p>

//             <p>
//                 Your 80G donation certificate has been successfully generated.
//                 Please find the certificate attached to this email.
//             </p>

//             <div style="
//                 background:#fffbeb;
//                 border:1px solid #fde68a;
//                 border-radius:8px;
//                 padding:15px;
//                 margin:20px 0;
//             ">

//                 <p style="margin:5px 0;">
//                     <strong>Certificate Number:</strong>
//                     ${certificateNumber}
//                 </p>

//                 <p style="margin:5px 0;">
//                     <strong>Donation Amount:</strong>
//                     ₹${Number(donationAmount).toLocaleString("en-IN")}
//                 </p>

//                 <p style="margin:5px 0;">
//                     <strong>Donation Date:</strong>
//                     ${donationDate}
//                 </p>

//             </div>

//             <p>
//                 Please retain this certificate for your records and
//                 applicable income-tax documentation.
//             </p>

//             <p>
//                 If you have any questions regarding this certificate,
//                 please contact us at
//                 <a href="mailto:${process.env.ORG_CONTACT_EMAIL}">
//                     ${process.env.ORG_CONTACT_EMAIL}
//                 </a>.
//             </p>

//             <br>

//             <p>
//                 Regards,<br>
//                 <strong>SpacECE India Foundation</strong><br>
//                 ${process.env.ORG_CONTACT_EMAIL}<br>
//                 ${process.env.ORG_CONTACT_PHONE}
//             </p>

//         </div>
//     `;

//     const attachments = certificateUrl
//         ? [
//             {
//                 filename: `80G-Certificate-${certificateNumber}.pdf`,
//                 path: certificateUrl,
//                 contentType: "application/pdf"
//             }
//         ]
//         : [];

//     return await this.sendEmail({
//         to: donorEmail,
//         subject: `80G Donation Certificate - ${certificateNumber}`,
//         html,
//         text: `
// Dear ${donorName},

// Thank you for your donation to SpacECE India Foundation.

// Your 80G donation certificate has been generated successfully and is attached to this email.

// Certificate Number: ${certificateNumber}
// Donation Amount: ₹${Number(donationAmount).toLocaleString("en-IN")}
// Donation Date: ${donationDate}

// Please retain this certificate for your records.

// Regards,
// SpacECE India Foundation
//         `,
//         attachments
//     });
// }
//     async sendDonationVerifiedEmail({
//     donorName,
//     donorEmail,
//     campaignName,
//     donationAmount,
//     transactionId,
//     certificateLink = ""
// }) {

//     const html = donationVerifiedTemplate({
//         donorName,
//         campaignName,
//         donationAmount,
//         transactionId,
//         certificateLink
//     });

//     const attachments = certificateLink
//         ? [{
//             filename: "SpaceECE-Donation-Certificate.pdf",
//             path: certificateLink,
//             contentType: "application/pdf",
//         }]
//         : [];

//     return await this.sendEmail({
//         to: donorEmail,
//         subject: `Donation Verified - ${campaignName}`,
//         html,
//         text: `Your donation has been verified successfully. Your donation certificate is attached to this email.`,
//         attachments,
//     });

// }

// async sendDonationResubmittedEmail({
//     donorName,
//     donorEmail,
//     campaignName,
//     donationAmount,
//     transactionId,
//     trackingLink
// }) {

//     const html = resendDonationRequestTemplate({
//         donorName,
//         campaignName,
//         donationAmount,
//         transactionId,
//         trackingLink
//     });

//     return await this.sendEmail({
//         to: donorEmail,
//         subject: `Updated Donation Received - ${campaignName}`,
//         html,
//         text: "Your updated donation request has been received and is now pending verification."
//     });

// }

//     async sendDonationConfirmationEmail({
//         donorName,
//         donorEmail,
//         campaignName,
//         donationAmount,
//         trackingLink,
//         transactionId
//     }) {

//         const html = donationConfirmationTemplate({
//         donorName,
//         campaignName,
//         donationAmount,
//         trackingLink,
//         transactionId
//     });

//         return await this.sendEmail({
//             to: donorEmail,
//             subject: `Donation Request Received - ${campaignName}`,
//             html,
//             text: `Your donation request has been received.`
//         });

//     }
//     async sendCampaignMilestoneUpdate({
//     donorName,
//     donorEmail,
//     campaignTitle,
//     milestones,
//     amountRaised,
//     targetAmount,
//     campaignLink
// }) {

//     const html = campaignMilestoneUpdateTemplate({
//         donorName,
//         campaignTitle,
//         milestones,
//         amountRaised,
//         targetAmount,
//         campaignLink
//     });

//     return await this.sendEmail({
//         to: donorEmail,
//         subject: `🎉 ${campaignTitle} achieved ${milestones.length} new milestone${milestones.length>1?"s":""} thanks to supporters like you!`,
//         html,
//         text: `${campaignTitle} has achieved ${milestones.length} new milestone${milestones.length>1?"s":""}`
//     });

// }
//     async sendDonationRejectedEmail({
//     donorName,
//     donorEmail,
//     campaignName,
//     donationAmount,
//     transactionId,
//     verificationRemarks,
//     resubmitLink
// }) {

//     const html = donationRejectedTemplate({
//         donorName,
//         campaignName,
//         donationAmount,
//         transactionId,
//         verificationRemarks,
//         resubmitLink
//     });

//     return await this.sendEmail({
//         to: donorEmail,
//         subject: `Donation Verification Failed - ${campaignName}`,
//         html,
//         text: `Your donation could not be verified. Please review the remarks and submit again.`
//     });
// }
// async sendNewCampaignNotification({
//     donorName,
//     donorEmail,
//     campaignTitle,
//     campaignDescription,
//     campaignTimeline,
//     campaignImage,
//     campaignLink
// }) {

//     const html = newCampaignNotificationTemplate({
//         donorName,
//         campaignTitle,
//         campaignDescription,
//         campaignTimeline,
//         campaignImage,
//         campaignLink
//     });

//     return await this.sendEmail({
//         to: donorEmail,
//         subject: `New Campaign Launched - ${campaignTitle}`,
//         html,
//         text: `A new campaign "${campaignTitle}" has been launched. Visit ${campaignLink} to learn more.`
//     });

// }
//     async sendOtpEmail(email, otp) {

//         const html = `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
//                 <h2>OTP Verification</h2>
//                 <p>Your verification code is:</p>
//                 <h1 style="letter-spacing: 4px;">${otp}</h1>
//                 <p>This OTP will expire in 5 minutes.</p>
//                 <p>If you did not request this OTP, please ignore this email.</p>
//             </div>
//         `;

//         return await this.sendEmail({
//             to: email,
//             subject: "OTP Verification",
//             html
//         });
//     }
// }

// const emailService = new EmailService();

// export default emailService

import nodemailer from "nodemailer";

import { donationConfirmationTemplate } from "../templates/successfullDonationRegistration.template.js";
import { donationVerifiedTemplate } from "../templates/donationVerified.template.js";
import { donationRejectedTemplate } from "../templates/donationRejectionTemplate.js";
import { resendDonationRequestTemplate } from "../templates/resendDonationRequest.template.js";
import { adminAccountCreatedTemplate } from "../templates/adminCreation.templates.js";
import { newCampaignNotificationTemplate } from "../templates/newCampaignNotification.template.js";
import { campaignMilestoneUpdateTemplate } from "../templates/campaignMilestoneUpdate.template.js";

class EmailService {
    constructor() {

        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = Number(process.env.SMTP_PORT);
        const smtpSecure = process.env.SMTP_SECURE === "true";
        const smtpUser = process.env.SMTP_USER;

        console.log("========================================");
        console.log("INITIALIZING SMTP SERVICE");
        console.log("========================================");

        console.log("SMTP Configuration:");
        console.log("SMTP_HOST:", smtpHost);
        console.log("SMTP_PORT:", smtpPort);
        console.log("SMTP_SECURE:", smtpSecure);
        console.log("SMTP_USER:", smtpUser ? `${smtpUser.substring(0, 3)}***` : "NOT SET");
        console.log(
            "SMTP_PASSWORD:",
            process.env.SMTP_PASSWORD ? "SET" : "NOT SET"
        );
        console.log(
            "SMTP_FROM:",
            process.env.SMTP_FROM || "NOT SET"
        );

        console.log("========================================");

        this.transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,

            auth: {
                user: smtpUser,
                pass: process.env.SMTP_PASSWORD
            },

            // Useful for debugging SMTP problems
            logger: process.env.SMTP_DEBUG === "true",
            debug: process.env.SMTP_DEBUG === "true",

            // Prevent requests from hanging indefinitely
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 60000
        });

        console.log("SMTP transporter created successfully.");

        this.verifySMTPConnection();
    }

    async verifySMTPConnection() {

        console.log("========================================");
        console.log("VERIFYING SMTP CONNECTION...");
        console.log("========================================");

        try {

            const result = await this.transporter.verify();

            console.log("SMTP VERIFY SUCCESS");
            console.log("SMTP server is ready to accept messages.");
            console.log("Verify result:", result);

        } catch (error) {

            console.error("========================================");
            console.error("SMTP VERIFY FAILED");
            console.error("========================================");

            console.error("Error message:", error.message);
            console.error("Error code:", error.code);
            console.error("Error command:", error.command);
            console.error("Error response:", error.response);
            console.error("Error responseCode:", error.responseCode);

            console.error("Full SMTP error:");
            console.error(error);

            console.error("========================================");
        }
    }

    async sendEmail({
        to,
        subject,
        html,
        text,
        attachments = []
    }) {

        console.log("========================================");
        console.log("STARTING EMAIL SEND");
        console.log("========================================");

        console.log("Email details:");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("From:", process.env.SMTP_FROM);
        console.log("SMTP Host:", process.env.SMTP_HOST);
        console.log("SMTP Port:", process.env.SMTP_PORT);
        console.log(
            "SMTP Secure:",
            process.env.SMTP_SECURE === "true"
        );

        console.log(
            "Attachments count:",
            attachments?.length || 0
        );

        if (attachments && attachments.length > 0) {

            console.log("Attachment details:");

            attachments.forEach((attachment, index) => {

                console.log(`Attachment ${index + 1}:`, {
                    filename: attachment.filename,
                    contentType: attachment.contentType,
                    path: attachment.path
                });

            });
        }

        console.log("Attempting transporter.sendMail()...");

        try {

            const info = await this.transporter.sendMail({

                from: process.env.SMTP_FROM,

                to,

                subject,

                text,

                html,

                attachments
            });

            console.log("========================================");
            console.log("EMAIL SENT SUCCESSFULLY");
            console.log("========================================");

            console.log("Message ID:", info.messageId);
            console.log("Accepted recipients:", info.accepted);
            console.log("Rejected recipients:", info.rejected);
            console.log("Pending recipients:", info.pending);
            console.log("SMTP response:", info.response);

            console.log("========================================");

            return info;

        } catch (error) {

            console.error("========================================");
            console.error("EMAIL SEND FAILED");
            console.error("========================================");

            console.error("Recipient:", to);
            console.error("Subject:", subject);

            console.error("Error message:", error.message);
            console.error("Error name:", error.name);
            console.error("Error code:", error.code);
            console.error("Error command:", error.command);
            console.error("Error response:", error.response);
            console.error("Error responseCode:", error.responseCode);

            console.error("Rejected recipients:", error.rejected);
            console.error("Rejected errors:", error.rejectedErrors);

            console.error("Full error object:");
            console.error(error);

            console.error("========================================");

            throw error;
        }
    }

    async sendCampaignOwnershipTransferEmail({
        adminName,
        adminEmail,
        transferredCampaigns,
        transferType
    }) {

        const campaignList = transferredCampaigns
            .map((campaign, index) =>
                `${index + 1}. ${campaign.campaignName}`
            )
            .join("\n");

        const isAssigned = transferType === "ASSIGNED";

        const subject = isAssigned
            ? "New Campaign Management Assigned"
            : "Campaign Management Transferred";

        const html = `
            <div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; line-height:1.7;">

                <h2>
                    ${
                        isAssigned
                            ? "Campaigns Assigned Successfully"
                            : "Campaign Ownership Updated"
                    }
                </h2>

                <p>
                    Hello <strong>${adminName}</strong>,
                </p>

                <p>
                    ${
                        isAssigned
                            ? "The following campaign(s) have been assigned to your account by the Super Admin. You are now responsible for managing them."
                            : "The management of the following campaign(s) has been transferred to another administrator by the Super Admin."
                    }
                </p>

                <div style="background:#f8f9fa;padding:15px;border-radius:8px;">

                    <h3>Campaigns</h3>

                    <ul>
                        ${transferredCampaigns
                            .map(c =>
                                `<li>${c.campaignName}</li>`
                            )
                            .join("")}
                    </ul>

                </div>

                <p>
                    ${
                        isAssigned
                            ? "You can now access these campaigns from your Admin Dashboard."
                            : "You will no longer be able to manage these campaigns from your account."
                    }
                </p>

                <br>

                <p>
                    Regards,<br>
                    <strong>SpaceECE Administration Team</strong>
                </p>

            </div>
        `;

        const text = `
Hello ${adminName},

${
    isAssigned
        ? "The following campaigns have been assigned to you:"
        : "The following campaigns have been transferred from your account:"
}

${campaignList}

Regards,
SpaceECE Team
`;

        return this.sendEmail({
            to: adminEmail,
            subject,
            html,
            text
        });
    }

    async sendAdminAccountCreatedEmail({
        adminName,
        adminEmail,
        temporaryPassword,
        loginUrl
    }) {

        const html = adminAccountCreatedTemplate({
            adminName,
            adminEmail,
            temporaryPassword,
            loginUrl
        });

        return this.sendEmail({

            to: adminEmail,

            subject: "Welcome to SpaceECE Admin Portal",

            html,

            text: `
Your administrator account has been created successfully.

Email: ${adminEmail}
Temporary Password: ${temporaryPassword}

Please login and change your password immediately.

Login: ${loginUrl}
`
        });
    }

    async send80GCertificateEmail({
        donorName,
        donorEmail,
        donationAmount,
        donationDate,
        certificateNumber,
        certificateUrl
    }) {

        console.log("========================================");
        console.log("80G CERTIFICATE EMAIL");
        console.log("========================================");

        console.log("Donor:", donorName);
        console.log("Donor Email:", donorEmail);
        console.log("Certificate Number:", certificateNumber);
        console.log("Certificate URL:", certificateUrl);
        console.log("Donation Amount:", donationAmount);
        console.log("Donation Date:", donationDate);

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; line-height: 1.7; color: #333;">

                <h2 style="color: #b45309;">
                    80G Donation Certificate
                </h2>

                <p>
                    Dear <strong>${donorName}</strong>,
                </p>

                <p>
                    Thank you for your valuable contribution to
                    <strong>SpacECE India Foundation</strong>.
                </p>

                <p>
                    Your 80G donation certificate has been successfully generated.
                    Please find the certificate attached to this email.
                </p>

                <div style="
                    background:#fffbeb;
                    border:1px solid #fde68a;
                    border-radius:8px;
                    padding:15px;
                    margin:20px 0;
                ">

                    <p style="margin:5px 0;">
                        <strong>Certificate Number:</strong>
                        ${certificateNumber}
                    </p>

                    <p style="margin:5px 0;">
                        <strong>Donation Amount:</strong>
                        ₹${Number(donationAmount).toLocaleString("en-IN")}
                    </p>

                    <p style="margin:5px 0;">
                        <strong>Donation Date:</strong>
                        ${donationDate}
                    </p>

                </div>

                <p>
                    Please retain this certificate for your records and
                    applicable income-tax documentation.
                </p>

                <p>
                    If you have any questions regarding this certificate,
                    please contact us at
                    <a href="mailto:${process.env.ORG_CONTACT_EMAIL}">
                        ${process.env.ORG_CONTACT_EMAIL}
                    </a>.
                </p>

                <br>

                <p>
                    Regards,<br>
                    <strong>SpacECE India Foundation</strong><br>
                    ${process.env.ORG_CONTACT_EMAIL}<br>
                    ${process.env.ORG_CONTACT_PHONE}
                </p>

            </div>
        `;

        const attachments = certificateUrl
            ? [
                {
                    filename: `80G-Certificate-${certificateNumber}.pdf`,
                    path: certificateUrl,
                    contentType: "application/pdf"
                }
            ]
            : [];

        console.log(
            "80G attachment prepared:",
            attachments.length > 0
                ? attachments[0]
                : "NO ATTACHMENT"
        );

        return this.sendEmail({

            to: donorEmail,

            subject: `80G Donation Certificate - ${certificateNumber}`,

            html,

            text: `
Dear ${donorName},

Thank you for your donation to SpacECE India Foundation.

Your 80G donation certificate has been generated successfully and is attached to this email.

Certificate Number: ${certificateNumber}
Donation Amount: ₹${Number(donationAmount).toLocaleString("en-IN")}
Donation Date: ${donationDate}

Please retain this certificate for your records.

Regards,
SpacECE India Foundation
`,

            attachments
        });
    }

    async sendDonationVerifiedEmail({
        donorName,
        donorEmail,
        campaignName,
        donationAmount,
        transactionId,
        certificateLink = ""
    }) {

        const html = donationVerifiedTemplate({
            donorName,
            campaignName,
            donationAmount,
            transactionId,
            certificateLink
        });

        const attachments = certificateLink
            ? [
                {
                    filename: "SpaceECE-Donation-Certificate.pdf",
                    path: certificateLink,
                    contentType: "application/pdf"
                }
            ]
            : [];

        return this.sendEmail({

            to: donorEmail,

            subject: `Donation Verified - ${campaignName}`,

            html,

            text:
                "Your donation has been verified successfully. Your donation certificate is attached to this email.",

            attachments
        });
    }

    async sendDonationResubmittedEmail({
        donorName,
        donorEmail,
        campaignName,
        donationAmount,
        transactionId,
        trackingLink
    }) {

        const html = resendDonationRequestTemplate({
            donorName,
            campaignName,
            donationAmount,
            transactionId,
            trackingLink
        });

        return this.sendEmail({

            to: donorEmail,

            subject: `Updated Donation Received - ${campaignName}`,

            html,

            text:
                "Your updated donation request has been received and is now pending verification."
        });
    }

    async sendDonationConfirmationEmail({
        donorName,
        donorEmail,
        campaignName,
        donationAmount,
        trackingLink,
        transactionId
    }) {

        const html = donationConfirmationTemplate({
            donorName,
            campaignName,
            donationAmount,
            trackingLink,
            transactionId
        });

        return this.sendEmail({

            to: donorEmail,

            subject: `Donation Request Received - ${campaignName}`,

            html,

            text:
                "Your donation request has been received."
        });
    }

    async sendCampaignMilestoneUpdate({
        donorName,
        donorEmail,
        campaignTitle,
        milestones,
        amountRaised,
        targetAmount,
        campaignLink
    }) {

        const html = campaignMilestoneUpdateTemplate({
            donorName,
            campaignTitle,
            milestones,
            amountRaised,
            targetAmount,
            campaignLink
        });

        return this.sendEmail({

            to: donorEmail,

            subject:
                `🎉 ${campaignTitle} achieved ${milestones.length} new milestone${
                    milestones.length > 1 ? "s" : ""
                } thanks to supporters like you!`,

            html,

            text:
                `${campaignTitle} has achieved ${milestones.length} new milestone${
                    milestones.length > 1 ? "s" : ""
                }`
        });
    }

    async sendDonationRejectedEmail({
        donorName,
        donorEmail,
        campaignName,
        donationAmount,
        transactionId,
        verificationRemarks,
        resubmitLink
    }) {

        const html = donationRejectedTemplate({
            donorName,
            campaignName,
            donationAmount,
            transactionId,
            verificationRemarks,
            resubmitLink
        });

        return this.sendEmail({

            to: donorEmail,

            subject:
                `Donation Verification Failed - ${campaignName}`,

            html,

            text:
                "Your donation could not be verified. Please review the remarks and submit again."
        });
    }

    async sendNewCampaignNotification({
        donorName,
        donorEmail,
        campaignTitle,
        campaignDescription,
        campaignTimeline,
        campaignImage,
        campaignLink
    }) {

        const html = newCampaignNotificationTemplate({
            donorName,
            campaignTitle,
            campaignDescription,
            campaignTimeline,
            campaignImage,
            campaignLink
        });

        return this.sendEmail({

            to: donorEmail,

            subject:
                `New Campaign Launched - ${campaignTitle}`,

            html,

            text:
                `A new campaign "${campaignTitle}" has been launched. Visit ${campaignLink} to learn more.`
        });
    }

    async sendOtpEmail(email, otp) {

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">

                <h2>OTP Verification</h2>

                <p>Your verification code is:</p>

                <h1 style="letter-spacing: 4px;">
                    ${otp}
                </h1>

                <p>
                    This OTP will expire in 5 minutes.
                </p>

                <p>
                    If you did not request this OTP, please ignore this email.
                </p>

            </div>
        `;

        return this.sendEmail({

            to: email,

            subject: "OTP Verification",

            html,

            text:
                `Your OTP verification code is ${otp}. This OTP will expire in 5 minutes.`
        });
    }
}

const emailService = new EmailService();

export default emailService;
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
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    async sendCampaignOwnershipTransferEmail({
    adminName,
    adminEmail,
    transferredCampaigns,
    transferType // "ASSIGNED" | "REMOVED"
}) {

    const campaignList = transferredCampaigns
        .map((campaign, index) => `${index + 1}. ${campaign.campaignName}`)
        .join("\n");

    const isAssigned = transferType === "ASSIGNED";

    const subject = isAssigned
        ? "New Campaign Management Assigned"
        : "Campaign Management Transferred";

    const html = `
        <div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; line-height:1.7;">
            <h2>${isAssigned ? "Campaigns Assigned Successfully" : "Campaign Ownership Updated"}</h2>

            <p>Hello <strong>${adminName}</strong>,</p>

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
                        .map(c => `<li>${c.campaignName}</li>`)
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

            <p>Regards,<br><strong>SpaceECE Administration Team</strong></p>

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
    async sendEmail({to, subject, html, text, attachments = []}) {
        return await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            text,
            html,
            attachments
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
        ? [{
            filename: "SpaceECE-Donation-Certificate.pdf",
            path: certificateLink,
            contentType: "application/pdf",
        }]
        : [];

    return await this.sendEmail({
        to: donorEmail,
        subject: `Donation Verified - ${campaignName}`,
        html,
        text: `Your donation has been verified successfully. Your donation certificate is attached to this email.`,
        attachments,
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

    return await this.sendEmail({
        to: donorEmail,
        subject: `Updated Donation Received - ${campaignName}`,
        html,
        text: "Your updated donation request has been received and is now pending verification."
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

        return await this.sendEmail({
            to: donorEmail,
            subject: `Donation Request Received - ${campaignName}`,
            html,
            text: `Your donation request has been received.`
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

    return await this.sendEmail({
        to: donorEmail,
        subject: `🎉 ${campaignTitle} achieved ${milestones.length} new milestone${milestones.length>1?"s":""} thanks to supporters like you!`,
        html,
        text: `${campaignTitle} has achieved ${milestones.length} new milestone${milestones.length>1?"s":""}`
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

    return await this.sendEmail({
        to: donorEmail,
        subject: `Donation Verification Failed - ${campaignName}`,
        html,
        text: `Your donation could not be verified. Please review the remarks and submit again.`
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

    return await this.sendEmail({
        to: donorEmail,
        subject: `New Campaign Launched - ${campaignTitle}`,
        html,
        text: `A new campaign "${campaignTitle}" has been launched. Visit ${campaignLink} to learn more.`
    });

}
    async sendOtpEmail(email, otp) {

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
                <h2>OTP Verification</h2>
                <p>Your verification code is:</p>
                <h1 style="letter-spacing: 4px;">${otp}</h1>
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you did not request this OTP, please ignore this email.</p>
            </div>
        `;

        return await this.sendEmail({
            to: email,
            subject: "OTP Verification",
            html
        });
    }
}

const emailService = new EmailService();

export default emailService

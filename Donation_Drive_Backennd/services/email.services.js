import nodemailer from "nodemailer";
import { donationConfirmationTemplate } from "../templates/successfullDonationRegistration.template.js";
import { donationVerifiedTemplate } from "../templates/donationVerified.template.js";
import { donationRejectedTemplate } from "../templates/donationRejectionTemplate.js";

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

    async sendEmail({to, subject, html, text}) {
        return await this.transporter.sendMail({
            from: `"${process.env.APP_NAME || "SPACECE INDIA FOUNDATION"}" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            text,
            html
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

    return await this.sendEmail({
        to: donorEmail,
        subject: `Donation Verified - ${campaignName}`,
        html,
        text: `Your donation has been verified successfully.`
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
import nodemailer from "nodemailer";

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
            from: `"${process.env.APP_NAME || "Gym Management"}" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            text,
            html
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
export const eightyGCertificateTemplate = (data) => {
    const {
        certificateNumber = "N/A",
        logoBase64 = "",
        donorName = "Valued Donor",
        panNumber = "N/A",
        donationAmount = 0,
        donationDate = "N/A",
        organisationName = "SpacECE India Foundation",
        organisationRegistrationNumber = "N/A",
        organisationAddress = "N/A",
        organisationPAN = "N/A",
        eightyGNumber = "N/A",
        eightyGValidity = "Perpetual",
        twelveABNumber = "N/A",
        twelveABValidity = "Valid",
        authorisedSignatory = "Authorized Signatory",
        authorisedDesignation = "Trustee / Director",
        contactEmail = "support@spacece.in",
        contactPhone = "N/A"
    } = data;

    // Helper to format currency number to words
    const numberToWords = (num) => {
        const a = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        ];
        const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

        const inWords = (n) => {
            let str = "";
            if (n > 9999999) {
                str += inWords(Math.floor(n / 10000000)) + " Crore ";
                n %= 10000000;
            }
            if (n > 99999) {
                str += inWords(Math.floor(n / 100000)) + " Lakh ";
                n %= 100000;
            }
            if (n > 999) {
                str += inWords(Math.floor(n / 1000)) + " Thousand ";
                n %= 1000;
            }
            if (n > 99) {
                str += inWords(Math.floor(n / 100)) + " Hundred ";
                n %= 100;
            }
            if (n > 0) {
                if (n < 20) str += a[n];
                else str += b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
            }
            return str.trim();
        };

        const parsed = parseInt(num, 10);
        return isNaN(parsed) || parsed <= 0 ? "Zero" : inWords(parsed) + " Only";
    };

    const amountInWords = numberToWords(donationAmount);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>80G Donation Receipt - ${certificateNumber}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            margin: 0;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #ffffff;
            color: #1e293b;
            font-size: 13px;
            line-height: 1.4;
            height: 100%;
        }

        .receipt-card {
            border: 2px solid #d97706;
            border-radius: 12px;
            padding: 20px 24px;
            background: #ffffff;
            position: relative;
            box-shadow: 0 4px 20px rgba(217, 119, 6, 0.08);
        }

        /* Watermark Background */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.035;
            z-index: 0;
            pointer-events: none;
            width: 380px;
        }

        .content {
            position: relative;
            z-index: 1;
        }

        /* Header Section */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .org-logo {
            width: 80px;
            vertical-align: middle;
            display: block;
        }

        .org-info {
            text-align: center;
            padding: 0 12px;
        }

        .org-title {
            font-size: 22px;
            font-weight: 800;
            color: #b45309;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .org-subtitle {
            font-size: 11px;
            color: #64748b;
            margin: 2px 0 4px 0;
            font-weight: 600;
        }

        .org-address {
            font-size: 11px;
            color: #475569;
            margin: 0;
            line-height: 1.3;
        }

        .receipt-meta {
            text-align: right;
            vertical-align: middle;
            width: 220px;
        }

        .meta-box {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 6px;
            padding: 8px 12px;
            display: inline-block;
            text-align: left;
            width: 100%;
        }

        .meta-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #b45309;
            display: block;
        }

        .meta-value {
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 4px;
        }

        /* Amount Ribbon */
        .amount-row {
            width: 100%;
            margin-bottom: 14px;
            border-collapse: collapse;
        }

        .amount-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 10px 16px;
        }

        .amount-number {
            font-size: 20px;
            font-weight: 800;
            color: #b45309;
        }

        .amount-words {
            font-size: 13px;
            font-weight: 600;
            color: #78350f;
            font-style: italic;
        }

        /* Detail Boxes Grid */
        .grid-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 12px 0;
            margin-bottom: 12px;
        }

        .section-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px;
            vertical-align: top;
            width: 50%;
        }

        .section-header {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: #d97706;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px dashed #cbd5e1;
        }

        .item-table {
            width: 100%;
            border-collapse: collapse;
        }

        .item-table td {
            padding: 4px 0;
            font-size: 12px;
        }

        .item-label {
            color: #64748b;
            font-weight: 600;
            width: 42%;
        }

        .item-value {
            color: #0f172a;
            font-weight: 700;
        }

        /* Tax Exemption Strip */
        .tax-strip {
            width: 100%;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 8px 14px;
            margin-bottom: 12px;
            border-collapse: collapse;
        }

        .tax-cell {
            padding: 4px 8px;
            font-size: 11px;
        }

        .tax-label {
            font-weight: 700;
            color: #92400e;
            text-transform: uppercase;
            font-size: 10px;
        }

        .tax-val {
            font-weight: 800;
            color: #0f172a;
        }

        /* Bottom Row - Signatory & Notes */
        .bottom-table {
            width: 100%;
            border-collapse: collapse;
        }

        .notes-column {
            vertical-align: top;
            padding-right: 20px;
        }

        .notes-box {
            font-size: 9.5px;
            color: #475569;
            line-height: 1.4;
            background: #ffffff;
            border-left: 3px solid #f59e0b;
            padding-left: 8px;
        }

        .notes-list {
            margin: 4px 0 0 0;
            padding-left: 14px;
        }

        .notes-list li {
            margin-bottom: 2px;
        }

        .signatory-column {
            width: 200px;
            text-align: center;
            vertical-align: bottom;
        }

        .sign-placeholder {
            border-bottom: 1.5px dashed #94a3b8;
            margin-bottom: 6px;
            height: 38px;
            position: relative;
        }

        .sign-tag {
            font-family: 'Segoe Script', 'Brush Script MT', cursive;
            font-size: 15px;
            color: #0f172a;
            position: absolute;
            bottom: 2px;
            left: 0;
            right: 0;
        }

        .sign-name {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
        }

        .sign-role {
            font-size: 10px;
            color: #64748b;
            margin: 0;
        }

        /* Legal Footer */
        .legal-footer {
            margin-top: 10px;
            padding-top: 6px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
            font-size: 9.5px;
            color: #64748b;
        }
    </style>
</head>
<body>

<div class="receipt-card">
    <!-- Background Watermark -->
    ${logoBase64 ? `<img class="watermark" src="${logoBase64}" alt="Watermark" />` : ""}

    <div class="content">
        <!-- HEADER -->
        <table class="header-table">
            <tr>
                <td style="width: 80px;">
                    ${logoBase64 ? `<img class="org-logo" src="${logoBase64}" alt="Logo" />` : ""}
                </td>
                <td class="org-info">
                    <h1 class="org-title">${organisationName}</h1>
                    <div class="org-subtitle">Retail Donation Management System</div>
                    <p class="org-address">
                        ${organisationAddress}<br/>
                        <b>Reg. No:</b> ${organisationRegistrationNumber} | <b>Org. PAN:</b> ${organisationPAN}<br/>
                        <b>Email:</b> ${contactEmail} | <b>Contact:</b> ${contactPhone}
                    </p>
                </td>
                <td class="receipt-meta">
                    <div class="meta-box">
                        <span class="meta-label">80G Certificate No.</span>
                        <div class="meta-value">${certificateNumber}</div>
                        <span class="meta-label">Date of Issue</span>
                        <div class="meta-value" style="margin-bottom:0;">${donationDate}</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- AMOUNT RIBBON -->
        <table class="amount-row">
            <tr>
                <td class="amount-box">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td>
                                <span style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase;">Amount Received (in words):</span>
                                <div class="amount-words">INR ${amountInWords}</div>
                            </td>
                            <td align="right">
                                <span class="amount-number">₹${Number(donationAmount).toLocaleString("en-IN")}</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- DETAILS (DONOR & DONATION) -->
        <table class="grid-table">
            <tr>
                <!-- Donor Details -->
                <td class="section-box">
                    <div class="section-header">Donor Details</div>
                    <table class="item-table">
                        <tr>
                            <td class="item-label">Donor Name</td>
                            <td class="item-value">${donorName}</td>
                        </tr>
                        <tr>
                            <td class="item-label">Donor PAN</td>
                            <td class="item-value" style="font-family: monospace, monospace;">${panNumber}</td>
                        </tr>
                        <tr>
                            <td class="item-label">Receipt Purpose</td>
                            <td class="item-value">Donation for Early Childhood Excellence</td>
                        </tr>
                    </table>
                </td>

                <!-- Transaction Details -->
                <td class="section-box">
                    <div class="section-header">Payment & Verification Details</div>
                    <table class="item-table">
                        <tr>
                            <td class="item-label">Payment Mode</td>
                            <td class="item-value">Online / Verified</td>
                        </tr>
                        <tr>
                            <td class="item-label">Donation Date</td>
                            <td class="item-value">${donationDate}</td>
                        </tr>
                        <tr>
                            <td class="item-label">Exemption Status</td>
                            <td class="item-value" style="color: #059669;">Eligible for 80G Deduction</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- STATUTORY / EXEMPTION DETAILS -->
        <table class="tax-strip">
            <tr>
                <td class="tax-cell">
                    <div class="tax-label">80G Reg. Number</div>
                    <div class="tax-val">${eightyGNumber}</div>
                </td>
                <td class="tax-cell">
                    <div class="tax-label">80G Validity</div>
                    <div class="tax-val">${eightyGValidity}</div>
                </td>
                <td class="tax-cell">
                    <div class="tax-label">12AB Registration</div>
                    <div class="tax-val">${twelveABNumber}</div>
                </td>
                <td class="tax-cell">
                    <div class="tax-label">12AB Validity</div>
                    <div class="tax-val">${twelveABValidity}</div>
                </td>
            </tr>
        </table>

        <!-- TERMS & SIGNATURE -->
        <table class="bottom-table">
            <tr>
                <td class="notes-column">
                    <div class="notes-box">
                        <b>Important Statutory Notes:</b>
                        <ol class="notes-list">
                            <li>Donations to <b>${organisationName}</b> are eligible for tax deduction under Section 80G(5)(vi) of the Income Tax Act, 1961.</li>
                            <li>PAN of the donor is compulsory for claiming tax deductions as per CBDT guidelines.</li>
                            <li>This is a computer-generated digital certificate requiring no physical signature.</li>
                        </ol>
                    </div>
                </td>
                <td class="signatory-column">
                    <div class="sign-placeholder">
                        <span class="sign-tag">${authorisedSignatory}</span>
                    </div>
                    <p class="sign-name">${authorisedSignatory}</p>
                    <p class="sign-role">${authorisedDesignation}</p>
                    <p class="sign-role" style="font-weight: 600; color: #b45309;">${organisationName}</p>
                </td>
            </tr>
        </table>

        <!-- FOOTER -->
        <div class="legal-footer">
            Thank you for supporting <b>${organisationName}</b>. For queries, reach out at <a href="mailto:${contactEmail}" style="color: #b45309; text-decoration: none;">${contactEmail}</a> | Website: <a href="https://spacece.in" style="color: #b45309; text-decoration: none;">www.spacece.in</a>
        </div>
    </div>
</div>

</body>
</html>
`;
};
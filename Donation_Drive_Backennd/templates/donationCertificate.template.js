const escapeXml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&apos;");

const formatAmount = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format(Number(amount) || 0);

const formatIssueDate = (issueDate) => new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date(issueDate));

// Produces a self-contained SVG so it can be uploaded directly to Cloudinary.
export const donationCertificateTemplate = ({
  donorName,
  campaignName,
  donationAmount,
  transactionId,
  issueDate,
}) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131" role="img" aria-label="Donation certificate">
  <rect width="1600" height="1131" fill="#f8f4e8"/>
  <rect x="36" y="36" width="1528" height="1059" rx="10" fill="none" stroke="#1f4e79" stroke-width="8"/>
  <rect x="58" y="58" width="1484" height="1015" rx="6" fill="none" stroke="#d6ad42" stroke-width="3"/>
  <text x="800" y="175" text-anchor="middle" fill="#1f4e79" font-family="Georgia, serif" font-size="42" font-weight="bold">SPACECE INDIA FOUNDATION</text>
  <line x1="560" y1="215" x2="1040" y2="215" stroke="#d6ad42" stroke-width="4"/>
  <text x="800" y="325" text-anchor="middle" fill="#1f4e79" font-family="Georgia, serif" font-size="76" font-weight="bold">Certificate of Appreciation</text>
  <text x="800" y="405" text-anchor="middle" fill="#4a4a4a" font-family="Arial, sans-serif" font-size="30">This certificate is proudly presented to</text>
  <text x="800" y="500" text-anchor="middle" fill="#a87816" font-family="Georgia, serif" font-size="64" font-style="italic">${escapeXml(donorName)}</text>
  <text x="800" y="575" text-anchor="middle" fill="#4a4a4a" font-family="Arial, sans-serif" font-size="30">in recognition of a verified contribution of</text>
  <text x="800" y="645" text-anchor="middle" fill="#1f4e79" font-family="Georgia, serif" font-size="52" font-weight="bold">${escapeXml(formatAmount(donationAmount))}</text>
  <text x="800" y="710" text-anchor="middle" fill="#4a4a4a" font-family="Arial, sans-serif" font-size="30">towards the campaign</text>
  <text x="800" y="775" text-anchor="middle" fill="#1f4e79" font-family="Georgia, serif" font-size="44" font-weight="bold">${escapeXml(campaignName)}</text>
  <line x1="185" y1="890" x2="620" y2="890" stroke="#1f4e79" stroke-width="2"/>
  <line x1="980" y1="890" x2="1415" y2="890" stroke="#1f4e79" stroke-width="2"/>
  <text x="185" y="930" fill="#4a4a4a" font-family="Arial, sans-serif" font-size="24">Transaction ID: ${escapeXml(transactionId)}</text>
  <text x="1415" y="930" text-anchor="end" fill="#4a4a4a" font-family="Arial, sans-serif" font-size="24">Issued: ${escapeXml(formatIssueDate(issueDate))}</text>
  <text x="800" y="1020" text-anchor="middle" fill="#777" font-family="Arial, sans-serif" font-size="20">Thank you for helping create meaningful impact.</text>
</svg>`;

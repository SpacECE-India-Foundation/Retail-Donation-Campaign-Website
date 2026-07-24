export const donationVerifiedTemplate = ({
    donorName,
    campaignName,
    donationAmount,
    transactionId,
    certificateLink
}) => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Donation Verified</title>
</head>

<body style="margin:0;padding:40px;background:#f4f7fb;font-family:Arial,sans-serif;">

<div style="
max-width:700px;
margin:auto;
background:white;
border-radius:14px;
overflow:hidden;
box-shadow:0 8px 25px rgba(0,0,0,.08);
">

<div style="
background:#1F4E79;
padding:30px;
text-align:center;
color:white;
">

<h1 style="margin:0;">
🎉 Donation Verified Successfully
</h1>

<p style="margin-top:10px;">
SPACECE INDIA FOUNDATION
</p>

</div>

<div style="padding:35px;">

<h2>Hello ${donorName},</h2>

<p>
Thank you for supporting <strong>${campaignName}</strong>.
</p>

<p>
Your donation has been successfully verified by our administration team.
</p>

<hr>

<table style="width:100%;font-size:16px;line-height:2;">
<tr>
<td><strong>Campaign</strong></td>
<td>${campaignName}</td>
</tr>

<tr>
<td><strong>Amount</strong></td>
<td>₹${donationAmount}</td>
</tr>

<tr>
<td><strong>Transaction ID</strong></td>
<td>${transactionId}</td>
</tr>

<tr>
<td><strong>Status</strong></td>
<td style="color:green;font-weight:bold;">
Verified ✅
</td>
</tr>

</table>


<p style="margin-top:35px;">
Your contribution will directly help us create a meaningful impact.
Thank you for being a part of this mission.
</p>

</div>

<div style="
background:#f7f7f7;
padding:20px;
text-align:center;
font-size:13px;
color:#666;
">

SPACECE INDIA FOUNDATION

</div>

</div>

</body>
</html>
`;
};
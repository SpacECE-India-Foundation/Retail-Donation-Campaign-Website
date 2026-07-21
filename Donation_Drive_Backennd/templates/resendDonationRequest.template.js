export const resendDonationRequestTemplate = ({
    donorName,
    campaignName,
    donationAmount,
    transactionId,
    trackingLink
}) => {

return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8" />
<title>Donation Resubmitted</title>
</head>

<body style="
margin:0;
padding:0;
background:#f5f7fb;
font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>

<td align="center" style="padding:40px 20px;">

<table width="650" cellpadding="0" cellspacing="0"
style="
background:#ffffff;
border-radius:18px;
overflow:hidden;
box-shadow:0px 15px 40px rgba(0,0,0,.08);
">

<!-- HEADER -->

<tr>

<td
style="
background:linear-gradient(135deg,#1976d2,#1565c0);
padding:45px;
text-align:center;
">

<img
src="https://lh7-us.googleusercontent.com/sitesv-images-rt/ACHe0d3YmwCmZxmhGgdDyAMEdurQvV_AXK6khHZIkcLYrVQ2R_iAROxhcAZP-yQIedodIMJ3iFonv2MyEItaRNHp72D7BAcFUhKPgyW5m_p9jbRB38um8HWdq4eM0_OX9D9yqiwdfD0-jZBcK5ig-Q1R8wKfHvMM6ONfGpNo15XlMxWiekIqOdOmNwgZuUNnkCg=w16383"
width="120"
/>

<h1 style="color:white;margin-top:20px;">
Donation Re-submitted Successfully
</h1>

<p style="color:white;font-size:16px;line-height:28px;">
We've received your updated donation details and payment proof.
</p>

</td>

</tr>

<!-- BODY -->

<tr>

<td style="padding:40px;">

<h2>Hello ${donorName},</h2>

<p style="font-size:16px;line-height:30px;color:#555;">

Thank you for updating your donation details.

Your revised donation request has been successfully received and has been placed back into our verification queue.

Our team will carefully review your updated payment details and notify you once verification is completed.

</p>

<table
width="100%"
style="
margin-top:35px;
background:#fafafa;
padding:25px;
border-radius:12px;
border:1px solid #eeeeee;
">

<tr>
<td><b>Campaign</b></td>
<td align="right">${campaignName}</td>
</tr>

<tr>
<td style="padding-top:12px;"><b>Amount</b></td>
<td align="right">₹${donationAmount}</td>
</tr>

<tr>
<td style="padding-top:12px;"><b>Transaction ID</b></td>
<td align="right">${transactionId}</td>
</tr>

<tr>
<td style="padding-top:12px;"><b>Status</b></td>

<td align="right">

<span
style="
background:#FFF8E1;
color:#ff9800;
padding:6px 14px;
border-radius:30px;
font-weight:bold;
font-size:13px;
">

Pending Verification

</span>

</td>

</tr>

</table>

<div style="text-align:center;margin-top:45px;">

<a
href="${trackingLink}"
style="
display:inline-block;
background:#1976d2;
color:white;
text-decoration:none;
padding:16px 34px;
border-radius:8px;
font-size:16px;
font-weight:bold;
">

Track Donation Status

</a>

</div>

<div
style="
margin-top:40px;
padding:25px;
background:#eef5ff;
border-left:5px solid #1976d2;
border-radius:8px;
">

<p
style="
margin:0;
font-size:15px;
line-height:28px;
color:#555;
">

✅ Your updated payment proof has been received.

📄 Your donation has been moved back to the verification process.

📧 We will notify you via email once the verification has been completed.

</p>

</div>

</td>

</tr>

<tr>

<td
style="
background:#111;
padding:35px;
text-align:center;
">

<p style="color:#ddd;margin:0;">
SpacECE India Foundation
</p>

<p
style="
color:#888;
margin-top:12px;
font-size:13px;
line-height:24px;
">

Empowering Futures Through Early Childhood Excellence

</p>

<p style="margin-top:20px;">

<a
href="https://spacece.in"
style="
color:#42a5f5;
text-decoration:none;
">

www.spacece.in

</a>

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
};
export const donationConfirmationTemplate = ({
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

<title>Donation Confirmation</title>

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
background:linear-gradient(135deg,#ffb300,#ff8f00);
padding:45px;
text-align:center;
">

<img
src="https://lh7-us.googleusercontent.com/sitesv-images-rt/ACHe0d3YmwCmZxmhGgdDyAMEdurQvV_AXK6khHZIkcLYrVQ2R_iAROxhcAZP-yQIedodIMJ3iFonv2MyEItaRNHp72D7BAcFUhKPgyW5m_p9jbRB38um8HWdq4eM0_OX9D9yqiwdfD0-jZBcK5ig-Q1R8wKfHvMM6ONfGpNo15XlMxWiekIqOdOmNwgZuUNnkCg=w16383"
width="120"
style="margin-bottom:20px"
/>

<h1
style="
margin:0;
color:white;
font-size:30px;
">

Thank You ❤️

</h1>

<p
style="
margin-top:12px;
color:white;
font-size:16px;
line-height:28px;
">

Your donation request has been successfully received.

</p>

</td>

</tr>

<!-- BODY -->

<tr>

<td style="padding:40px;">

<h2
style="
margin-top:0;
color:#222;
">

Hello ${donorName},

</h2>

<p
style="
font-size:16px;
line-height:30px;
color:#555;
">

Thank you for supporting

<b>SpacECE India Foundation.</b>

We have successfully received your donation details.

Our team will verify your submitted transaction and
keep you informed throughout the verification process.

</p>

<!-- DONATION DETAILS -->

<table
width="100%"
style="
margin-top:35px;
background:#fafafa;
border-radius:12px;
padding:25px;
border:1px solid #eeeeee;
">

<tr>

<td style="padding:10px 0;">

<b>Campaign</b>

</td>

<td align="right">

${campaignName}

</td>

</tr>

<tr>

<td style="padding:10px 0;">

<b>Donation Amount</b>

</td>

<td align="right">

₹${donationAmount}

</td>

</tr>

<tr>

<td style="padding:10px 0;">

<b>Transaction ID</b>

</td>

<td align="right">

${transactionId}

</td>

</tr>

<tr>

<td style="padding:10px 0;">

<b>Status</b>

</td>

<td align="right">

<span
style="
background:#FFF8E1;
color:#ff9800;
padding:6px 12px;
border-radius:50px;
font-size:13px;
font-weight:bold;
">

Pending Verification

</span>

</td>

</tr>

</table>

<!-- CTA -->

<div
style="
text-align:center;
margin-top:45px;
">

<a
href="${trackingLink}"

style="
display:inline-block;
background:#ff9800;
color:white;
text-decoration:none;
padding:16px 34px;
font-size:16px;
font-weight:bold;
border-radius:8px;
">

Track Donation Status

</a>

</div>

<!-- MESSAGE -->

<div
style="
margin-top:40px;
padding:25px;
background:#fffaf2;
border-left:5px solid #ff9800;
border-radius:8px;
">

<p
style="
margin:0;
font-size:15px;
line-height:28px;
color:#555;
">

📧 Further communication regarding your donation,
verification status and certificate (if applicable)
will be shared with you through your registered email.

Please keep your Transaction ID safe until verification
is completed.

</p>

</div>

</td>

</tr>

<!-- FOOTER -->

<tr>

<td
style="
background:#111;
padding:35px;
text-align:center;
">

<p
style="
color:#ddd;
margin:0;
font-size:15px;
">

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

<p
style="
margin-top:20px;
">

<a
href="https://spacece.in"
style="
color:#ffb300;
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

}
export const adminAccountCreatedTemplate = ({
    adminName,
    adminEmail,
    temporaryPassword,
    loginUrl
}) => {

    return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Welcome to SpaceECE</title>
</head>

<body style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f4; padding:30px;">

<div style="max-width:650px; margin:auto; background:white; border-radius:10px; padding:30px;">

<h2 style="color:#2563eb;">
Welcome to SpaceECE Admin Portal
</h2>

<p>Dear <strong>${adminName}</strong>,</p>

<p>
Your administrator account has been created successfully by the Super Administrator.
</p>

<div style="background:#f8fafc;padding:20px;border-radius:8px;">

<p><strong>Email</strong></p>
<p>${adminEmail}</p>

<p><strong>Temporary Password</strong></p>
<p style="font-size:18px;font-weight:bold;color:#dc2626;">
${temporaryPassword}
</p>

</div>

<p style="margin-top:25px;">
For security reasons, please login using the credentials above and change your password immediately.
</p>

<div style="margin-top:30px;">
<a
href="${loginUrl}"
style="
background:#2563eb;
color:white;
padding:12px 25px;
text-decoration:none;
border-radius:6px;
font-weight:bold;
display:inline-block;
">
Login to Admin Portal
</a>
</div>

<p style="margin-top:35px;">
If you were not expecting this account, please contact the Super Administrator immediately.
</p>

<hr>

<p style="font-size:13px;color:#666;">
This is an automated email from SpaceECE. Please do not reply to this email.
</p>

</div>

</body>
</html>
`;
};
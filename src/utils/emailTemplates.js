const signUpTemp = (verificationCode, fullName) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Verify your account</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>
<td align="center" style="padding:40px 20px;">

<table width="650" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:16px;overflow:hidden;
box-shadow:0 10px 40px rgba(0,0,0,.08);">

<tr>
<td
style="
background:linear-gradient(135deg,#0F172A,#1E3A8A,#DC2626);
padding:45px;
text-align:center;
">

<h1 style="margin:0;color:white;font-size:32px;">
📖 MCF E-Library
</h1>

<p style="margin-top:10px;color:#e5e7eb;font-size:15px;">
Methodist Campus Fellowship
</p>

</td>
</tr>

<tr>

<td style="padding:45px;">

<h2 style="color:#0F172A;margin-top:0;">
Welcome, ${fullName} 👋
</h2>

<p style="font-size:16px;color:#555;line-height:28px;">

Thank you for creating an account on the
<strong>Methodist Campus Fellowship E-Library.</strong>

To complete your registration,
please verify your email using the code below.

</p>

<div
style="
margin:35px auto;
background:#f8fafc;
border:2px dashed #DC2626;
border-radius:12px;
padding:30px;
text-align:center;
">

<p style="margin:0;color:#555;font-size:16px;">
Verification Code
</p>

<h1
style="
margin:12px 0;
letter-spacing:10px;
font-size:42px;
color:#DC2626;
">
${verificationCode}
</h1>

<p style="color:#777;">
This code expires in <strong>15 minutes</strong>.
</p>

</div>

<table width="100%" cellpadding="10">

<tr>

<td align="center">
🎓<br>
Faculty Based Learning
</td>

<td align="center">
📚<br>
Read Materials Online
</td>

<td align="center">
🙏<br>
Grow in Faith
</td>

</tr>

</table>

<p
style="
margin-top:40px;
font-size:15px;
line-height:28px;
color:#666;
">

If you didn't create this account,
you can safely ignore this email.

</p>

</td>

</tr>

<tr>

<td
style="
background:#0F172A;
padding:25px;
text-align:center;
">

<p style="color:#d1d5db;margin:0;">
Made with ❤️ by
<a
href="https://daniel-lac.vercel.app"
style="color:#ffffff;text-decoration:none;font-weight:bold;">
DannyTech
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

module.exports = {
  signUpTemp,
}
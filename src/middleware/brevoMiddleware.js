const Brevo = require('sib-api-v3-sdk');

const defaultClient = Brevo.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new Brevo.TransactionalEmailsApi();

exports.sendMail = async (toEmail, subject, htmlContent, senderName = 'MCF E-libery', senderEmail = 'dobi44134@gmail.com') => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.htmlContent = htmlContent;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully:', response.messageId);
    return response;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw new Error('Email sending failed');
  }
};
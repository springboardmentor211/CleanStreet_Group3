require('dotenv').config();
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  try {
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error('Error getting access token:', err);
          reject('Failed to create access token');
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USERNAME,
        accessToken,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Clean Street" <${process.env.EMAIL_USERNAME}>`,
      to: process.env.EMAIL_USERNAME,
      subject: 'Test Email from Clean Street',
      text: 'This is a test email to verify email sending functionality.',
      html: '<h2>Test Email</h2><p>This is a test email to verify email sending functionality.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending test email:', error);
    if (error.response) {
      console.error('Error response body:', error.response.body);
    }
  }
}

sendTestEmail();

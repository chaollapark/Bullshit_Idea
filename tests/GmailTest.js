const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
require('dotenv').config();

async function authorize() {
  const credentialsPath = 'credentials.json';
  const tokenPath = 'token.json';
  const scopes = ['https://www.googleapis.com/auth/gmail.send'];

  // Load client secrets from a local file.
  const credentials = JSON.parse(fs.readFileSync(credentialsPath));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  if (fs.existsSync(tokenPath)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(tokenPath)));
    return oAuth2Client;
  }

  // If no token, proceed with the authentication
  const client = await authenticate({
    scopes: scopes,
    keyfilePath: credentialsPath,
  });
  if (client.credentials) {
    fs.writeFileSync(tokenPath, JSON.stringify(client.credentials));
  }
  return client;
}

async function sendMessage(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const message = 'Subject: Hello World\n\nThis is a test email sent from a test script.';
  const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
  return res.data;
}

async function testSendEmail() {
  try {
    const auth = await authorize();
    const response = await sendMessage(auth);
    console.log('Email sent:', response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testSendEmail();

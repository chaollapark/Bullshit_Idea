const { namespaceWrapper } = require('@_koii/namespace-wrapper');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
require('dotenv').config();

class Submission {
  constructor() {
    this.credentialsPath = 'credentials.json';
    this.tokenPath = 'token.json';
    this.scopes = ['https://www.googleapis.com/auth/gmail.send'];
  }

  async authorize() {
    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: this.scopes,
      keyfilePath: this.credentialsPath,
    });
    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return client;
  }

  async loadSavedCredentialsIfExist() {
    try {
      const content = fs.readFileSync(this.tokenPath);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  async saveCredentials(client) {
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: client._clientId,
      client_secret: client._clientSecret,
      refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(this.tokenPath, payload);
  }

  async sendMessage(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const message = 'Subject: Hello World\n\nThis is a test email sent from a Koii task.';
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    return res.data;
  }

  async task(round) {
    console.log('Started Task', new Date(), process.env.TEST_KEYWORD);
    try {
      console.log('ROUND', round);

      const auth = await this.authorize();
      const emailResponse = await this.sendMessage(auth);

      console.log('Email sent:', emailResponse);

      const value = 'Email sent: ' + emailResponse.id;
      if (value) {
        await namespaceWrapper.storeSet('value', value);
      }
      return value;
    } catch (err) {
      console.log('ERROR IN EXECUTING TASK', err);
      return 'ERROR IN EXECUTING TASK ' + err;
    }
  }

  async submitTask(round) {
    console.log('SUBMIT TASK CALLED ROUND NUMBER', round);
    try {
      console.log('SUBMIT TASK SLOT', await namespaceWrapper.getSlot());
      const submission = await this.fetchSubmission(round);
      console.log('SUBMISSION', submission);
      await namespaceWrapper.checkSubmissionAndUpdateRound(submission, round);
      console.log('SUBMISSION CHECKED AND ROUND UPDATED');
      return submission;
    } catch (error) {
      console.log('ERROR IN SUBMISSION', error);
    }
  }

  async fetchSubmission(round) {
    console.log('Started Submission', new Date(), process.env.TEST_KEYWORD);
    console.log('FETCH SUBMISSION');
    const value = await namespaceWrapper.storeGet('value');
    return value;
  }
}

const submission = new Submission();
module.exports = { submission };
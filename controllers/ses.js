const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({ region: 'us-east-1' });
const { SES_FROM_EMAIL } = process.env;

/**
 * Helper function to send verficaiton email.
 * @param {String} email email recipient.
 * @param {String} message message we are sending with the email
 * @returns Result of SESClient.sendEmail.
 */
const sendEmail = async (email, message) => {
  const params = {
    Source: SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Strain Hunter Update',
      },
      Body: {
        Text: {
          Data: message,
        },
      },
    },
  };

  return sesClient.send(new SendEmailCommand(params));
};

module.exports = {
  sendEmail,
};

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({ region: 'us-east-1' });

const SOURCE_EMAIL = 'strainhunterapp@gmail.com';

/**
 * Helper function to send verficaiton email.
 * @param {String} email email recipient.
 * @param {String} message message we are sending with the email
 * @returns Result of SESClient.sendEmail.
 */
const sendEmail = async (email, message) => {
  //   const emailParams = {
  //     Destination: {
  //       ToAddresses: [email],
  //     },
  //     Message: {
  //       Body: {
  //         Text: { Data: `Please confirm your email by visiting the following link ${shortenVerificationLink}` },
  //       },
  //       Subject: { Data: `Feastables: Please Confirm Your Email` },
  //     },
  //     Source: FEASTABLES_EMAIL,
  //   };

  const params = {
    Source: SOURCE_EMAIL,
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

const { makeRequest } = require('./request');

const { CLICK_SEND_BASIC_AUTH } = process.env;

const baseConfig = {
  method: 'post',
  url: 'https://rest.clicksend.com/v3/sms/send',
  headers: {
    Authorization: `Basic ${CLICK_SEND_BASIC_AUTH}`,
    'Content-Type': 'application/json',
  },
};
/**
 * Helper function to send an sms message to a number.
 * @param {String} message Message we want to send in sms.
 * @param {String} to Phone number we are sending to.
 * @returns truthy if successful, falsy if not.
 */
const sendSms = async (message, to) => {
  const config = {
    ...baseConfig,
    data: JSON.stringify({
      messages: [
        {
          source: 'php',
          body: `Strain Hunter: ${message}`,
          to,
        },
      ],
    }),
  };

  // const results = await makeRequest(config);

  // return results?.data || null;
  return null;
};

module.exports = {
  sendSms,
};

const axios = require('axios');

const { CLICK_SEND_BASIC_AUTH } = process.env;
/**
 * Helper function to send an sms message to a number.
 * @param {String} message Message we want to send in sms.
 * @param {String} to Phone number we are sending to.
 * @returns truthy if successful, falsy if not.
 */
const sendSms = async (message, to) => {
  const data = {
    messages: [
      {
        source: 'php',
        body: `Strain Hunter: ${message}`,
        to,
      },
    ],
  };

  console.log(data);

  const results = await axios.post('https://rest.clicksend.com/v3/sms/send', data, {
    headers: {
      Authorization: `Basic ${CLICK_SEND_BASIC_AUTH}`,
      'Content-Type': 'application/json',
    },
  });

  console.log(results.data);

  return results?.data || null;
};

module.exports = {
  sendSms,
};

const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { sendEmail } = require('./controllers/ses');
const { getUser } = require('./controllers/users');
const { STORE_MAPPER } = require('./controllers/config');

const handler = async (event) => {
  console.log('logging event');
  console.log(JSON.stringify(event));

  const { Records: records } = event;

  const promises = records.map(async (record) => {
    const newImageRaw = record.dynamodb.NewImage;

    const newImage = unmarshall(newImageRaw);

    const { tracker_obj: target, user_id: phoneNumber } = newImage;

    const user = await getUser(phoneNumber);

    if (user) {
      const { email } = user;
      const { strain_name: strainName, dispensary } = target;

      const message =
        `OUT OF STOCK ALERT: ${strainName} from ${STORE_MAPPER[dispensary]} is OUT OF STOCK.\n\n` +
        'Thank you for using Strain Hunter, we will notify you when this comes back in stock, stay tuned!';

      await sendEmail(email, message);
    }
  });

  await Promise.all(promises);
  return {
    statusCode: 200,
  };
};

module.exports = {
  handler,
};

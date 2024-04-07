const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { sendEmail } = require('./controllers/ses');
const { getUser } = require('./controllers/users');

const handler = async (event) => {
  console.log('logging event');
  console.log(JSON.stringify(event));

  const { Records: records } = event;

  const promises = records.map(async (record) => {
    const newImageRaw = record.dynamodb.NewImage;

    const newImage = unmarshall(newImageRaw);

    const { tracker_obj: target, user_id: phoneNumber } = newImage;
    const { message } = target;

    const user = await getUser(phoneNumber);

    if (user) {
      const { email } = user;

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

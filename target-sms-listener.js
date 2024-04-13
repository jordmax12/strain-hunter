const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { sendSms } = require('./controllers/click-send');

const handler = async (event) => {
  console.log('logging event');
  console.log(JSON.stringify(event));

  const { Records: records } = event;

  const promises = records.map(async (record) => {
    const newImageRaw = record.dynamodb.NewImage;

    const newImage = unmarshall(newImageRaw);

    const { tracker_obj: target, user_id: phoneNumber } = newImage;
    const { strain_name: strainName, brand } = target;

    await sendSms(`New update for ${brand} (${strainName})! Check your email.`, phoneNumber);
  });

  await Promise.all(promises);

  return {
    statusCode: 200,
  };
};

module.exports = {
  handler,
};

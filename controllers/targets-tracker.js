const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument, PutCommand } = require('@aws-sdk/lib-dynamodb');

const { TARGETS_TRACKER_TABLE, DYNAMO_DB_ENDPOINT, REGION } = process.env;

const dynamoDbClient = new DynamoDBClient({
  endpoint: DYNAMO_DB_ENDPOINT,
  region: REGION,
  sslEnabled: true,
  apiVersion: '2012-08-10',
  convertEmptyValues: true,
});

const CLIENT = DynamoDBDocument.from(dynamoDbClient);
/**
 * Helper function to create a target tracker.
 * @param {Object} targetTrackerObjRaw Raw object we want to associate with this target tracker.
 * @param {String} targetTrackerId Normalized target tracker ID from `generateTargetTrackerId`.
 * @param {String} phoneNumber Phone number of user.
 * @returns Target tracker object that was added.
 */
const createTargetTracker = async (targetTrackerObjRaw, targetTrackerId, phoneNumber) => {
  const targetTrackerObj = {
    id: targetTrackerId,
    user_id: phoneNumber,
    tracker_obj: targetTrackerObjRaw,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const params = {
    TableName: TARGETS_TRACKER_TABLE,
    Item: targetTrackerObj,
    ConditionExpression: 'attribute_not_exists(id) AND attribute_not_exists(user_id)',
  };

  try {
    await CLIENT.send(new PutCommand(params));
    return targetTrackerObj;
  } catch (e) {
    console.error(e);
    return null;
  }
};
/**
 * Helper function to generate a normalized target tracker id.
 * @param {String} strainName Strain name from data.
 * @param {String} brandName Brand name from data.
 * @param {Number} dispensaryCode Dispensary code strain was found at.
 * @param {String} size Size we are adding.
 * @param {String} phoneNumber Phone number of user.
 * @returns Normalized target tracker ID.
 */
const generateTargetTrackerId = (strainName, brandName, dispensaryCode, size, phoneNumber) =>
  `${strainName.toUpperCase()}-${brandName.toUpperCase()}-${dispensaryCode}-${size.toUpperCase()}-${phoneNumber}`.replace(
    /\s/g,
    '_'
  );

module.exports = {
  createTargetTracker,
  generateTargetTrackerId,
};

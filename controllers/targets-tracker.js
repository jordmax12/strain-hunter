const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument, DeleteCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
    product_id: targetTrackerObjRaw.product_id,
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
 * Helper function to delete a target tracker.
 * @param {String} targetTrackerId Normalized target tracker ID from `generateTargetTrackerId`.
 * @param {String} phoneNumber Phone number of user.
 * @returns Truthy value if successedful, falsy if not.
 */
const deleteTargetTracker = async (targetTrackerId, phoneNumber) => {
  try {
    const params = {
      TableName: TARGETS_TRACKER_TABLE,
      Key: {
        id: targetTrackerId,
        user_id: phoneNumber,
      },
    };
    await CLIENT.send(new DeleteCommand(params));
    return true;
  } catch (err) {
    console.error('Error:', err);
    return false;
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
/**
 * Helper function to get live targets.
 * @param {Object} exclusiveStartKey Object from DDB containing ExlucsiveStartKey data, primary hash/sort keys
 * that it last scanned. (Optional, default null).
 * @param {Number} limit The maximum amount of targets we want to get from DDB in this call.
 * (Optional, default 1000);
 * @returns List of targets, if exists.
 */
const getAllTargets = async (exclusiveStartKey = null, limit = 1000) => {
  let params = {
    TableName: TARGETS_TRACKER_TABLE,
    KeyConditionExpression: 'attribute_exists(conversation_id)',
    Limit: limit,
  };

  if (exclusiveStartKey) {
    params = { ...params, ExclusiveStartKey: exclusiveStartKey };
  }

  try {
    const result = await CLIENT.send(new ScanCommand(params));
    return (result && result.Items) || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

module.exports = {
  createTargetTracker,
  deleteTargetTracker,
  generateTargetTrackerId,
  getAllTargets,
};

const { randomUUID } = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument, PutCommand } = require('@aws-sdk/lib-dynamodb');

const { TARGETS_TRACKER_ARCHIVE_TABLE, DYNAMO_DB_ENDPOINT, REGION } = process.env;

const dynamoDbClient = new DynamoDBClient({
  endpoint: DYNAMO_DB_ENDPOINT,
  region: REGION,
  sslEnabled: true,
  apiVersion: '2012-08-10',
  convertEmptyValues: true,
});

const CLIENT = DynamoDBDocument.from(dynamoDbClient);

/**
 * Helper function to create a target tracker archive.
 * @param {Object} trackerObj Item we want to save with the archive.
 * @param {Object} rawItem Raw item from DDB, just for auditing purposes want to store the original item.
 * @param {String} phoneNumber Phone number of user.
 * @returns Target tracker archive object that was added.
 */
const createTargetTrackerArchive = async (trackerObj, rawItem, phoneNumber) => {
  const targetTrackerObj = {
    id: randomUUID(),
    user_id: phoneNumber,
    tracker_obj: trackerObj,
    raw_item: rawItem,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const params = {
    TableName: TARGETS_TRACKER_ARCHIVE_TABLE,
    Item: targetTrackerObj,
  };

  await CLIENT.send(new PutCommand(params));
  return targetTrackerObj;
};

module.exports = {
  createTargetTrackerArchive,
};

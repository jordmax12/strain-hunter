const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument, GetCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const { USERS_TABLE, DYNAMO_DB_ENDPOINT, REGION } = process.env;

const dynamoDbClient = new DynamoDBClient({
  endpoint: DYNAMO_DB_ENDPOINT,
  region: REGION,
  sslEnabled: true,
  apiVersion: '2012-08-10',
  convertEmptyValues: true,
});

const CLIENT = DynamoDBDocument.from(dynamoDbClient);

/**
 * Helper function to create a user.
 * @param {String} phoneNumber Phone number of user.
 * @param {String} email Email of user.
 * @returns User with phone number provided if exists, null if not.
 */
const createUser = async (phoneNumber, email) => {
  const userItem = {
    phone_number: phoneNumber,
    email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const params = {
    TableName: USERS_TABLE,
    Item: userItem,
    ConditionExpression: 'attribute_not_exists(phone_number)',
  };

  try {
    await CLIENT.send(new PutCommand(params));
    return userItem;
  } catch (e) {
    return null;
  }
};
/**
 * Helper function to get all users.
 * @returns All users (paginated if applicable).
 */
const getAllUsers = async () => {
  const params = {
    TableName: USERS_TABLE,
  };

  const results = await CLIENT.send(new ScanCommand(params));
  return results?.Items || [];
};
/**
 * Helper function to get a user from DDB.
 * @param {String} phoneNumber Phone number of user.
 * @returns User with phone number provided if exists, null if not.
 */
const getUser = async (phoneNumber) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      phone_number: phoneNumber,
    },
  };

  const result = await CLIENT.send(new GetCommand(params));
  return result?.Item || null;
};

module.exports = {
  createUser,
  getAllUsers,
  getUser,
};

const mockPhoneNumber = '+18471234567';
const mockEmail = 'mock@email.com';
const mockTrackerObj = {
  tracker: 'obj',
};

const mockRawItem = {
  raw: 'item',
};

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockUsersTable = 'users-table';

process.env.USERS_TABLE = mockUsersTable;
process.env.DDB_ENDPOINT = 'https://ddb-endpoint';
process.env.AWS_REGION = 'us-east-1';

const { createUser, getAllUsers, getUser } = require('../../controllers/users');

beforeAll(() => {
  ddbMock.reset();
  jest.clearAllMocks();
  process.env.USERS_TABLE = mockUsersTable;
  process.env.DDB_ENDPOINT = 'https://ddb-endpoint';
  process.env.AWS_REGION = 'us-east-1';
});

afterEach(() => {
  ddbMock.reset();
  jest.clearAllMocks();
});

afterAll(() => {
  ddbMock.reset();
  process.env.USERS_TABLE = null;
  process.env.DDB_ENDPOINT = null;
  process.env.AWS_REGION = null;
});

describe('testing users controller file', () => {
  test('createUser', async () => {
    ddbMock.on(PutCommand).resolves(true);
    const mockExpectedItem = {
      phone_number: mockPhoneNumber,
      email: mockEmail,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };
    const result = await createUser(mockPhoneNumber, mockEmail);

    expect(result).toEqual(mockExpectedItem);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockUsersTable,
      Item: mockExpectedItem,
      ConditionExpression: 'attribute_not_exists(phone_number)',
    });
  });
  test('createUser - error', async () => {
    ddbMock.on(PutCommand).rejects(true);
    const mockExpectedItem = {
      phone_number: mockPhoneNumber,
      email: mockEmail,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };
    const result = await createUser(mockPhoneNumber, mockEmail);

    expect(result).toBeFalsy();

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockUsersTable,
      Item: mockExpectedItem,
      ConditionExpression: 'attribute_not_exists(phone_number)',
    });
  });
  test('getAllUsers', async () => {
    const mockItems = [{ phone_number: mockPhoneNumber, email: mockEmail }];
    ddbMock.on(ScanCommand).resolves({
      Items: mockItems,
    });

    const result = await getAllUsers();

    expect(result).toEqual(mockItems);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockUsersTable,
    });
  });
  test('getAllUsers - no items', async () => {
    const mockItems = [{ phone_number: mockPhoneNumber, email: mockEmail }];
    ddbMock.on(ScanCommand).resolves({
      invalid: mockItems,
    });

    const result = await getAllUsers();

    expect(result).toEqual([]);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockUsersTable,
    });
  });
  test('getUser', async () => {
    const mockItem = { phone_number: mockPhoneNumber, email: mockEmail };
    ddbMock.on(GetCommand).resolves({
      Item: mockItem,
    });

    const result = await getUser(mockPhoneNumber);

    expect(result).toEqual(mockItem);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockUsersTable,
      Key: {
        phone_number: mockPhoneNumber,
      },
    });
  });
  test('getUser - no item', async () => {
    const mockItem = { phone_number: mockPhoneNumber, email: mockEmail };
    ddbMock.on(GetCommand).resolves({
      invalid: mockItem,
    });

    const result = await getUser(mockPhoneNumber);

    expect(result).toBeFalsy();

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockUsersTable,
      Key: {
        phone_number: mockPhoneNumber,
      },
    });
  });
});

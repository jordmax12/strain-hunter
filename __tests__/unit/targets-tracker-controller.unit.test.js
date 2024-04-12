const mockProductId = 1895322;
const mockPhoneNumber = '+18471234567';
const mockStrainName = 'Daily Grapes';
const mockBrandName = 'NEZ';
const mockDispensaryCode = 253;
const mockSize = 'eighth';

const mockTrackerObj = {
  product_id: mockProductId,
};

const mockRawItem = {
  raw: 'item',
};
const mockTargetTrackerId = 'mock-target-tracker-id';
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockTargetsTrackeTable = 'targets-tracker-table';

process.env.TARGETS_TRACKER_TABLE = mockTargetsTrackeTable;
process.env.DDB_ENDPOINT = 'https://ddb-endpoint';
process.env.AWS_REGION = 'us-east-1';

const {
  createTargetTracker,
  deleteTargetTracker,
  generateTargetTrackerId,
  getAllTargets,
} = require('../../controllers/targets-tracker');

beforeAll(() => {
  ddbMock.reset();
  jest.clearAllMocks();
  process.env.TARGETS_TRACKER_TABLE = mockTargetsTrackeTable;
  process.env.DDB_ENDPOINT = 'https://ddb-endpoint';
  process.env.AWS_REGION = 'us-east-1';
});

afterEach(() => {
  ddbMock.reset();
  jest.clearAllMocks();
});

afterAll(() => {
  ddbMock.reset();
  process.env.TARGETS_TRACKER_TABLE = null;
  process.env.DDB_ENDPOINT = null;
  process.env.AWS_REGION = null;
});

describe('testing targets tracker file', () => {
  test('createTargetTracker', async () => {
    ddbMock.on(PutCommand).resolves(true);
    const result = await createTargetTracker(mockTrackerObj, mockTargetTrackerId, mockPhoneNumber);
    const mockExpectedItem = {
      id: expect.any(String),
      user_id: mockPhoneNumber,
      tracker_obj: mockTrackerObj,
      product_id: mockProductId,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };

    expect(result).toEqual(mockExpectedItem);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackeTable,
      Item: mockExpectedItem,
      ConditionExpression: 'attribute_not_exists(id) AND attribute_not_exists(user_id)',
    });
  });
  test('createTargetTracker - error', async () => {
    ddbMock.on(PutCommand).rejects(true);
    const result = await createTargetTracker(mockTrackerObj, mockTargetTrackerId, mockPhoneNumber);
    const mockExpectedItem = {
      id: expect.any(String),
      user_id: mockPhoneNumber,
      tracker_obj: mockTrackerObj,
      product_id: mockProductId,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };

    expect(result).toBeFalsy();

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackeTable,
      Item: mockExpectedItem,
      ConditionExpression: 'attribute_not_exists(id) AND attribute_not_exists(user_id)',
    });
  });
  test('deleteTargetTracker', async () => {
    ddbMock.on(DeleteCommand).resolves(true);
    const result = await deleteTargetTracker(mockTargetTrackerId, mockPhoneNumber);

    expect(result).toBeTruthy();

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackeTable,
      Key: {
        id: mockTargetTrackerId,
        user_id: mockPhoneNumber,
      },
    });
  });
  test('deleteTargetTracker - error', async () => {
    ddbMock.on(DeleteCommand).rejects(true);
    const result = await deleteTargetTracker(mockTargetTrackerId, mockPhoneNumber);

    expect(result).toBeFalsy();

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackeTable,
      Key: {
        id: mockTargetTrackerId,
        user_id: mockPhoneNumber,
      },
    });
  });
  test('getAllTargets', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [
        {
          hello: 'world',
        },
      ],
    });
    const result = await getAllTargets();

    expect(result).toEqual([
      {
        hello: 'world',
      },
    ]);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackeTable,
      KeyConditionExpression: 'attribute_exists(conversation_id)',
      Limit: 1000,
    });
  });
  test('getAllTargets - error', async () => {
    ddbMock.on(ScanCommand).rejects('hello error');
    const result = await getAllTargets();

    expect(result).toEqual([]);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackeTable,
      KeyConditionExpression: 'attribute_exists(conversation_id)',
      Limit: 1000,
    });
  });
  test('getAllTargets - no items', async () => {
    ddbMock.on(ScanCommand).resolves({
      invalid: [
        {
          hello: 'world',
        },
      ],
    });
    const result = await getAllTargets();

    expect(result).toEqual([]);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackeTable,
      KeyConditionExpression: 'attribute_exists(conversation_id)',
      Limit: 1000,
    });
  });
  test('getAllTargets - without default args', async () => {
    ddbMock.on(ScanCommand).resolves({
      invalid: [
        {
          hello: 'world',
        },
      ],
    });
    const result = await getAllTargets({ exclusive: 'start_key' }, 50);

    expect(result).toEqual([]);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackeTable,
      KeyConditionExpression: 'attribute_exists(conversation_id)',
      Limit: 50,
      ExclusiveStartKey: { exclusive: 'start_key' },
    });
  });
  test('generateTargetTrackerId', () => {
    const result = generateTargetTrackerId(
      mockStrainName,
      mockBrandName,
      mockDispensaryCode,
      mockSize,
      mockPhoneNumber
    );

    expect(result).toEqual(
      `${mockStrainName.toUpperCase()}-${mockBrandName.toUpperCase()}-${mockDispensaryCode}-${mockSize.toUpperCase()}-${mockPhoneNumber}`.replace(
        /\s/g,
        '_'
      )
    );
  });
});

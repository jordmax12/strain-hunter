const mockPhoneNumber = '+18471234567';
const mockTrackerObj = {
  tracker: 'obj',
};

const mockRawItem = {
  raw: 'item',
};

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockTargetsTrackerArchiveTable = 'targets-tracker-archive-table';

process.env.TARGETS_TRACKER_ARCHIVE_TABLE = mockTargetsTrackerArchiveTable;
process.env.DDB_ENDPOINT = 'https://ddb-endpoint';
process.env.AWS_REGION = 'us-east-1';

const { createTargetTrackerArchive } = require('../../controllers/targets-tracker-archive');

beforeAll(() => {
  ddbMock.reset();
  jest.clearAllMocks();
  process.env.TARGETS_TRACKER_ARCHIVE_TABLE = mockTargetsTrackerArchiveTable;
  process.env.DDB_ENDPOINT = 'https://ddb-endpoint';
  process.env.AWS_REGION = 'us-east-1';
});

afterEach(() => {
  ddbMock.reset();
  jest.clearAllMocks();
});

afterAll(() => {
  ddbMock.reset();
  process.env.TARGETS_TRACKER_ARCHIVE_TABLE = null;
  process.env.DDB_ENDPOINT = null;
  process.env.AWS_REGION = null;
});

describe('testing targets tracker archive controller file', () => {
  test('createTargetTrackerArchive', async () => {
    ddbMock.on(PutCommand).resolves(true);
    const result = await createTargetTrackerArchive(mockTrackerObj, mockRawItem, mockPhoneNumber);
    const mockExpectedItem = {
      id: expect.any(String),
      user_id: mockPhoneNumber,
      tracker_obj: mockTrackerObj,
      raw_item: mockRawItem,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };

    expect(result).toEqual(mockExpectedItem);

    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: mockTargetsTrackerArchiveTable,
      Item: mockExpectedItem,
    });
  });
});

const mockPhoneNumber = '+18471234567';
const mockStoreId = 253;
const mockStrainName = 'Daily Grapes';
const mockMessage = 'mock-message';

const mockTrackerObj = {
  dispensary: mockStoreId,
  strain_name: mockStrainName,
  message: mockMessage,
};
const mockEmail = 'mock@email.com';
const mockSendEmail = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@aws-sdk/util-dynamodb', () => ({
  unmarshall: (image) => image,
}));

jest.mock('../../controllers/ses', () => ({
  sendEmail: mockSendEmail,
}));

jest.mock('../../controllers/users', () => ({
  getUser: mockGetUser,
}));

const { handler } = require('../../target-email-listener');

beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('testing target email listener handler', () => {
  test('handler', async () => {
    const mockEvent = {
      Records: [
        {
          dynamodb: {
            NewImage: {
              tracker_obj: mockTrackerObj,
              user_id: mockPhoneNumber,
            },
          },
        },
      ],
    };

    mockGetUser.mockReturnValueOnce({ email: mockEmail });
    mockSendEmail.mockReturnValueOnce(true);
    const result = await handler(mockEvent);
    expect(result).toEqual({
      statusCode: 200,
    });

    expect(mockGetUser).toHaveBeenCalledWith(mockPhoneNumber);

    expect(mockSendEmail).toHaveBeenCalledWith(mockEmail, mockMessage);
  });
  test('handler - no user', async () => {
    const mockEvent = {
      Records: [
        {
          dynamodb: {
            NewImage: {
              tracker_obj: mockTrackerObj,
              user_id: mockPhoneNumber,
            },
          },
        },
      ],
    };

    mockGetUser.mockReturnValueOnce(null);
    const result = await handler(mockEvent);
    expect(result).toEqual({
      statusCode: 200,
    });

    expect(mockGetUser).toHaveBeenCalledWith(mockPhoneNumber);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

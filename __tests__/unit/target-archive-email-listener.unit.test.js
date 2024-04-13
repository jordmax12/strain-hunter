const mockPhoneNumber = '+18471234567';
const mockStoreId = 253;
const mockStrainName = 'Daily Grapes';

const mockTrackerObj = {
  dispensary: mockStoreId,
  strain_name: mockStrainName,
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

const { STORE_MAPPER } = require('../../controllers/config');
const { handler } = require('../../target-archive-email-listener');

beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('testing target archive email listener handler', () => {
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

    const expectedMessage =
      `OUT OF STOCK ALERT: ${mockStrainName} from ${STORE_MAPPER[mockStoreId]} is OUT OF STOCK.\n\n` +
      'Thank you for using Strain Hunter, we will notify you when this comes back in stock, stay tuned!';
    expect(mockSendEmail).toHaveBeenCalledWith(mockEmail, expectedMessage);
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

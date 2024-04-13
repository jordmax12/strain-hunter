const mockPhoneNumber = '+18471234567';
const mockStoreId = 253;
const mockStrainName = 'Daily Grapes';
const mockBrandName = 'NEZ';

const mockTrackerObj = {
  dispensary: mockStoreId,
  strain_name: mockStrainName,
  brand: mockBrandName,
};
const mockSendSms = jest.fn();

jest.mock('@aws-sdk/util-dynamodb', () => ({
  unmarshall: (image) => image,
}));

jest.mock('../../controllers/click-send', () => ({
  sendSms: mockSendSms,
}));

const { handler } = require('../../target-sms-listener');

beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('testing target sms listener handler', () => {
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

    mockSendSms.mockReturnValueOnce(true);
    const result = await handler(mockEvent);
    expect(result).toEqual({
      statusCode: 200,
    });

    const expectedMessage = `New update for ${mockBrandName} (${mockStrainName})! Check your email.`;
    expect(mockSendSms).toHaveBeenCalledWith(expectedMessage, mockPhoneNumber);
  });
});

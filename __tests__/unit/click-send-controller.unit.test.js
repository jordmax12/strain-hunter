const mockMessage = 'mock-message';
const mockTo = 'mock-to';
const mockClickSendAuth = 'mock-click-send-auth';
const mockMakeRequest = jest.fn();

const mockBaseConfig = {
  method: 'post',
  url: 'https://rest.clicksend.com/v3/sms/send',
  headers: {
    Authorization: `Basic ${mockClickSendAuth}`,
    'Content-Type': 'application/json',
  },
};

process.env.CLICK_SEND_BASIC_AUTH = mockClickSendAuth;

const { sendSms } = require('../../controllers/click-send');

beforeAll(() => {
  jest.clearAllMocks();
  process.env.CLICK_SEND_BASIC_AUTH = mockClickSendAuth;
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  process.env.CLICK_SEND_BASIC_AUTH = null;
});

jest.mock('../../controllers/request', () => ({
  makeRequest: mockMakeRequest,
}));

describe('testing click-send controller', () => {
  test('sendSms', async () => {
    mockMakeRequest.mockReturnValueOnce({
      data: {
        hello: 'world',
      },
    });

    const results = await sendSms(mockMessage, mockTo);
    expect(results).toEqual({
      hello: 'world',
    });
    expect(mockMakeRequest).toHaveBeenCalledWith({
      ...mockBaseConfig,
      data: JSON.stringify({
        messages: [
          {
            source: 'php',
            body: `Strain Hunter: ${mockMessage}`,
            to: mockTo,
          },
        ],
      }),
    });
  });
  test('sendSms - no results', async () => {
    mockMakeRequest.mockReturnValueOnce({
      invalid: {
        hello: 'world',
      },
    });

    const results = await sendSms(mockMessage, mockTo);
    expect(results).toBeFalsy();
    expect(mockMakeRequest).toHaveBeenCalledWith({
      ...mockBaseConfig,
      data: JSON.stringify({
        messages: [
          {
            source: 'php',
            body: `Strain Hunter: ${mockMessage}`,
            to: mockTo,
          },
        ],
      }),
    });
  });
});

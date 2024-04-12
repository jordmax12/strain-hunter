const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { mockClient } = require('aws-sdk-client-mock');

// Create a mock for the SESClient
const sesMock = mockClient(SESClient);

const mockEmail = 'mock@email.com';
const mockMessage = 'Hello World';

const { sendEmail } = require('../../controllers/ses');

beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('testing ses controller', () => {
  test('should send an email with the correct parameters', async () => {
    sesMock.on(SendEmailCommand).resolves({
      MessageId: 'test-message-id',
    });

    const result = await sendEmail(mockEmail, mockMessage);

    expect(sesMock.calls()[0].args[0].input).toEqual({
      Source: 'strainhunterapp@gmail.com',
      Destination: {
        ToAddresses: [mockEmail],
      },
      Message: {
        Subject: {
          Data: 'Strain Hunter Update',
        },
        Body: {
          Text: {
            Data: mockMessage,
          },
        },
      },
    });

    expect(result).toEqual({
      MessageId: 'test-message-id',
    });
  });
});

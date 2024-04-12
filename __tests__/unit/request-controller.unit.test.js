const axios = require('axios');

jest.mock('axios');

const { makeRequest } = require('../../controllers/request');

beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('testing request controller', () => {
  test('makeRequest', async () => {
    const mockResponse = {
      hello: 'world',
    };

    const mockConfig = {
      method: 'POST',
      url: 'mock-url',
      headers: {
        Authorization: `Basic Auth`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({ hello: 'world' }),
    };

    axios.mockImplementationOnce(() => Promise.resolve({ data: mockResponse }));

    const results = await makeRequest(mockConfig);
    expect(results).toEqual({
      hello: 'world',
    });
    expect(axios).toHaveBeenCalledWith({
      url: 'mock-url',
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: `Basic Auth`,
        'Content-Type': 'application/json',
      }),
      data: JSON.stringify({ hello: 'world' }),
    });
  });
  test('makeRequest - error', async () => {
    axios.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await makeRequest({});

    expect(result).toBeFalsy();
    expect(axios).toHaveBeenCalledWith({});
  });
});

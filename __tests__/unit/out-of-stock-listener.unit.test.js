const mockPhoneNumber = '+18471234567';
const mockStoreId = 253;
const mockProductId = 1895322;
const mockId = 'mock-id';
const mockTargets = [
  {
    product_id: mockProductId,
    user_id: mockPhoneNumber,
    id: mockId,
    tracker_obj: {
      dispensary: mockStoreId,
    },
  },
];

const mockGetProductIdByStoreId = jest.fn();
const mockGetAllTargets = jest.fn();
const mockDeleteTargetTracker = jest.fn();
const mockCreateTargetTrackerArchive = jest.fn();

jest.mock('../../controllers/algolia', () => ({
  getProductIdByStoreId: mockGetProductIdByStoreId,
}));

jest.mock('../../controllers/targets-tracker', () => ({
  getAllTargets: mockGetAllTargets,
  deleteTargetTracker: mockDeleteTargetTracker,
}));

jest.mock('../../controllers/targets-tracker-archive', () => ({
  createTargetTrackerArchive: mockCreateTargetTrackerArchive,
}));

const { handler } = require('../../out-of-stock-listener');

beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('testing out of stock listener handler', () => {
  test('handler', async () => {
    mockGetAllTargets.mockReturnValueOnce(mockTargets);
    mockGetProductIdByStoreId.mockReturnValueOnce(null);
    mockCreateTargetTrackerArchive.mockReturnValueOnce(true);
    mockDeleteTargetTracker.mockReturnValueOnce(true);

    const result = await handler();
    expect(result).toEqual({
      statusCode: 200,
    });

    expect(mockGetProductIdByStoreId).toHaveBeenCalledWith(mockProductId, mockStoreId);
    expect(mockCreateTargetTrackerArchive).toHaveBeenCalledWith(
      { ...mockTargets[0].tracker_obj, target_id: mockId },
      mockTargets[0],
      mockPhoneNumber
    );
    expect(mockDeleteTargetTracker).toHaveBeenCalledWith(mockId, mockPhoneNumber);
  });
  test('handler - not out of stock', async () => {
    mockGetAllTargets.mockReturnValueOnce(mockTargets);
    mockGetProductIdByStoreId.mockReturnValueOnce(true);

    const result = await handler();
    expect(result).toEqual({
      statusCode: 200,
    });

    expect(mockGetProductIdByStoreId).toHaveBeenCalledWith(mockProductId, mockStoreId);
    expect(mockCreateTargetTrackerArchive).not.toHaveBeenCalled();
    expect(mockDeleteTargetTracker).not.toHaveBeenCalled();
  });
});

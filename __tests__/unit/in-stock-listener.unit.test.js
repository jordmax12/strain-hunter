const mockPhoneNumber = '+18471234567';
const mockStoreId = 253;
const mockBrandName = 'NEZ';
const mockProductId = 1895322;
const mockStrainName = 'Daily Grapes';
const mockSizes = ['eighth'];
const mockTargets = [
  {
    brand: mockBrandName,
    dispensary: mockStoreId,
    strain_name: mockStrainName.toUpperCase(),
  },
];
const mockRootSubtype = 'mock-root-subtype';
const mockPercentThc = '24.4';
const mockPrices = ['60'];

const mockGetAllBrandsForFlower = jest.fn();
const mockGetFlowerForBrand = jest.fn();
const mockHandleNormalizedHits = jest.fn();
const mockCreateTargetTracker = jest.fn();
const mockGetAllUsers = jest.fn();

jest.mock('../../controllers/algolia', () => ({
  getAllBrandsForFlower: mockGetAllBrandsForFlower,
  getFlowerForBrand: mockGetFlowerForBrand,
}));

jest.mock('../../controllers/logic', () => ({
  handleNormalizedHits: mockHandleNormalizedHits,
}));

jest.mock('../../controllers/targets-tracker', () => ({
  generateTargetTrackerId: jest.requireActual('../../controllers/targets-tracker').generateTargetTrackerId,
  createTargetTracker: mockCreateTargetTracker,
}));

jest.mock('../../controllers/users', () => ({
  getAllUsers: mockGetAllUsers,
}));

const { handler } = require('../../in-stock-listener');

beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('testing in stock listener handler', () => {
  test('handler', async () => {
    mockGetAllUsers.mockReturnValueOnce([
      {
        phone_number: mockPhoneNumber,
        targets: mockTargets,
      },
    ]);

    mockGetAllBrandsForFlower.mockReturnValueOnce([mockBrandName]);
    mockGetFlowerForBrand.mockReturnValueOnce({
      raw_name: mockStrainName,
      root_subtype: mockRootSubtype,
      percent_thc: mockPercentThc,
      custom_name: mockStrainName,
      brand_name: mockBrandName,
      available_weights: mockSizes,
      sizes: mockSizes.join('/'),
      prices: mockPrices.join('/'),
      product_id: mockProductId,
    });
    mockHandleNormalizedHits.mockReturnValueOnce([
      {
        strain_name: mockStrainName,
        dispensary: mockStoreId,
        brand: mockBrandName,
        sizes: mockSizes[0],
      },
    ]);

    mockCreateTargetTracker.mockReturnValueOnce(true);

    const result = await handler();
    expect(result).toEqual({
      statusCode: 200,
    });

    expect(mockGetAllBrandsForFlower).toHaveBeenCalledWith(mockStoreId);
    expect(mockGetFlowerForBrand).toHaveBeenCalledWith(mockBrandName, mockStoreId);
    expect(mockHandleNormalizedHits).toHaveBeenCalledWith(
      [
        {
          available_weights: mockSizes,
          brand_name: mockBrandName,
          custom_name: mockStrainName,
          percent_thc: mockPercentThc,
          prices: mockPrices[0],
          product_id: mockProductId,
          raw_name: mockStrainName,
          root_subtype: mockRootSubtype,
          sizes: mockSizes[0],
        },
      ],
      mockStoreId,
      mockTargets,
      mockPhoneNumber,
      mockStoreId
    );
    expect(mockCreateTargetTracker).toHaveBeenCalledWith(
      {
        brand: mockBrandName,
        dispensary: mockStoreId,
        sizes: mockSizes[0],
        strain_name: mockStrainName,
      },
      `${mockStrainName}-${mockBrandName}-${mockStoreId}-${mockSizes[0]}-${mockPhoneNumber}`
        .toUpperCase()
        .replace(/\s/g, '_'),
      mockPhoneNumber
    );
  });
});

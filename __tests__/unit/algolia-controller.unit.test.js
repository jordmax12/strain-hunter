const mockStoreId = 'mock-store-id';
const mockAlgoliaApikey = 'mock-algolia-api-key';
const mockPercentThc = '24.43';
const mockRootSubtype = null;
const mockHitName = 'Daily Grapes';
const mockProductId = 1895322;
const mockBrandName = 'NEZ';
const mockAvailableWeights = ['eighth', 'half ounce'];
const mockBaseConfig = {
  method: 'post',
  url: 'https://vfm4x0n23a-dsn.algolia.net/1/indexes/menu-products-production/query',
  headers: {
    'Content-Type': 'application/json',
    'x-algolia-api-key': mockAlgoliaApikey,
    'x-algolia-application-id': 'VFM4X0N23A', // NOTE: just got this off of natures care.
  },
};
const mockMakeRequest = jest.fn();

process.env.ALGOLIA_API_KEY = mockAlgoliaApikey;

const { getAllBrandsForFlower, getFlowerForBrand, getProductIdByStoreId } = require('../../controllers/algolia');

beforeAll(() => {
  jest.clearAllMocks();
  process.env.ALGOLIA_API_KEY = mockAlgoliaApikey;
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  process.env.ALGOLIA_API_KEY = null;
});

jest.mock('../../controllers/request', () => ({
  makeRequest: mockMakeRequest,
}));

describe('testing algolia controller', () => {
  test('getAllBrandsForFlower', async () => {
    mockMakeRequest.mockReturnValueOnce({
      facets: {
        brand: {
          MOCK_BRAND_1: {
            hello: 'world',
          },
          MOCK_BRAND_2: {
            hello: 'world',
          },
        },
      },
    });

    const results = await getAllBrandsForFlower(mockStoreId);
    expect(results).toEqual(['MOCK_BRAND_1', 'MOCK_BRAND_2']);
    expect(mockMakeRequest).toHaveBeenCalledWith({
      ...mockBaseConfig,
      data: JSON.stringify({
        query: '',
        filters: `store_id = ${mockStoreId} AND (root_types:"flower")`,
        facets: ['*'],
      }),
    });
  });
  test('getFlowerForBrand', async () => {
    mockMakeRequest.mockReturnValueOnce({
      hits: [
        {
          percent_thc: mockPercentThc,
          root_subtype: mockRootSubtype,
          available_weights: mockAvailableWeights,
          name: mockHitName,
          product_id: mockProductId,
          price_eighth: 60,
          price_half_ounce: 150,
        },
      ],
    });

    const results = await getFlowerForBrand(mockBrandName, mockStoreId);

    const mockExpected = {
      available_weights: ['eighth', 'half ounce'],
      brand_name: mockBrandName,
      custom_name: `${mockHitName} (${mockPercentThc}% THC)`,
      percent_thc: mockPercentThc,
      prices: '60/150',
      product_id: mockProductId,
      raw_name: mockHitName,
      root_subtype: null,
      sizes: 'eighth/half ounce',
    };
    expect(results).toEqual([mockExpected]);
    expect(mockMakeRequest).toHaveBeenCalledWith({
      ...mockBaseConfig,
      data: JSON.stringify({
        query: '',
        hitsPerPage: 16,
        filters: `store_id:${mockStoreId} AND (brand:"${mockBrandName}" AND kind:"flower")`,
      }),
    });
  });
  test('getFlowerForBrand with root_subtype', async () => {
    mockMakeRequest.mockReturnValueOnce({
      hits: [
        {
          percent_thc: mockPercentThc,
          root_subtype: 'mock-root-subtype',
          available_weights: mockAvailableWeights,
          name: mockHitName,
          product_id: mockProductId,
          price_eighth: 60,
          price_half_ounce: 150,
        },
      ],
    });

    const results = await getFlowerForBrand(mockBrandName, mockStoreId);

    const mockExpected = {
      available_weights: ['eighth', 'half ounce'],
      brand_name: mockBrandName,
      custom_name: `${mockHitName} (${mockPercentThc}% THC - mock-root-subtype)`,
      percent_thc: mockPercentThc,
      prices: '60/150',
      product_id: mockProductId,
      raw_name: mockHitName,
      root_subtype: 'mock-root-subtype',
      sizes: 'eighth/half ounce',
    };
    expect(results).toEqual([mockExpected]);
    expect(mockMakeRequest).toHaveBeenCalledWith({
      ...mockBaseConfig,
      data: JSON.stringify({
        query: '',
        hitsPerPage: 16,
        filters: `store_id:${mockStoreId} AND (brand:"${mockBrandName}" AND kind:"flower")`,
      }),
    });
  });
  test('getProductIdByStoreId', async () => {
    const mockHits = {
      hits: [
        {
          percent_thc: mockPercentThc,
          root_subtype: mockRootSubtype,
          available_weights: mockAvailableWeights,
          name: mockHitName,
          product_id: mockProductId,
          price_eighth: 60,
          price_half_ounce: 150,
        },
      ],
    };
    mockMakeRequest.mockReturnValueOnce(mockHits);
    const results = await getProductIdByStoreId(mockProductId, mockStoreId);
    expect(results).toEqual(mockHits.hits[0]);
    expect(mockMakeRequest).toHaveBeenCalledWith({
      ...mockBaseConfig,
      data: JSON.stringify({
        query: '',
        filters: `store_id = ${mockStoreId} AND (product_id = ${mockProductId})`,
      }),
    });
  });
  test('getProductIdByStoreId - no results', async () => {
    const mockHits = {};
    mockMakeRequest.mockReturnValueOnce(mockHits);
    const results = await getProductIdByStoreId(mockProductId, mockStoreId);
    expect(results).toEqual(null);
    expect(mockMakeRequest).toHaveBeenCalledWith({
      ...mockBaseConfig,
      data: JSON.stringify({
        query: '',
        filters: `store_id = ${mockStoreId} AND (product_id = ${mockProductId})`,
      }),
    });
  });
});

const mockRootSubtype = 'mock-root-subtype';
const mockPercentThc = '24.43%';
const mockPhone = '+18471234567';
const mockProductId1 = 123456;
const mockProductId2 = 654321;
const mockDispensary = 253;

const mockNormalizedHits = [
  {
    raw_name: 'Daily Grapes',
    custom_name: 'Daily Grapes',
    brand_name: 'NEZ',
    sizes: 'eighth',
    prices: '60',
    root_subtype: mockRootSubtype,
    percent_thc: mockPercentThc,
    product_id: mockProductId1,
  },
  {
    raw_name: 'Fried Strawberries',
    custom_name: 'Fried Strawberries',
    brand_name: 'The Botanist',
    sizes: 'eighth',
    prices: '60',
    root_subtype: mockRootSubtype,
    percent_thc: mockPercentThc,
    product_id: mockProductId2,
  },
];

const mockTargets = [
  {
    strain_name: 'DAILY GRAPES',
    brand: 'NEZ',
    dispensary: mockDispensary,
  },
  {
    strain_name: 'FRIED STRAWBERRIES',
    brand: 'THE BOTANIST',
    dispensary: mockDispensary,
  },
];

const { handleNormalizedHits } = require('../../controllers/logic');

beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('testing logic controller', () => {
  test('handleNormalizedHits', () => {
    const results = handleNormalizedHits(mockNormalizedHits, mockDispensary, mockTargets, mockPhone, mockDispensary);
    const mockExpected = [
      {
        brand: mockNormalizedHits[0].brand_name.toUpperCase(),
        dispensary: mockDispensary,
        message: `

*IN STOCK*

    name: Daily Grapes by NEZ

    dispensary: RISE (Mundelein)

    sizes: eighth

    prices: 60

    user: +18471234567
`,
        percent_thc: mockPercentThc,
        phone_number: mockPhone,
        prices: '60',
        product_id: mockProductId1,
        root_subtype: mockRootSubtype,
        sizes: 'eighth',
        strain_name: 'DAILY GRAPES',
      },
      {
        brand: mockNormalizedHits[1].brand_name.toUpperCase(),
        dispensary: mockDispensary,
        message: `

*IN STOCK*

    name: Fried Strawberries by The Botanist

    dispensary: RISE (Mundelein)

    sizes: eighth

    prices: 60

    user: +18471234567
`,
        percent_thc: mockPercentThc,
        phone_number: mockPhone,
        prices: '60',
        product_id: mockProductId2,
        root_subtype: mockRootSubtype,
        sizes: 'eighth',
        strain_name: 'FRIED STRAWBERRIES',
      },
    ];
    expect(results).toEqual(mockExpected);
  });
  test('handleNormalizedHits - no finds', () => {
    const results = handleNormalizedHits(mockNormalizedHits, 123, mockTargets, mockPhone, mockDispensary);
    const mockExpected = [];
    expect(results).toEqual(mockExpected);
  });
});

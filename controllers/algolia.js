const { makeRequest } = require('./request');
const { ROOT_AGOLIA_URL, verboseLogger } = require('./config');

const { ALGOLIA_API_KEY } = process.env;

const KIND = 'flower';

const baseConfig = {
  method: 'post',
  url: ROOT_AGOLIA_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-algolia-api-key': ALGOLIA_API_KEY,
    'x-algolia-application-id': 'VFM4X0N23A', // NOTE: just got this off of natures care.
  },
};
/**
 * Helper function to normalized a hit object with values we need downstream.
 * @param {Object} hit Raw hit from algolia API results.
 * @param {String} brandName Brand name we are working with.
 * @returns Object containing normalized hit data.
 */
const normalizeHit = (hit, brandName) => {
  const {
    percent_thc: percentThc,
    root_subtype: rootSubtype,
    available_weights: availableWeights,
    name,
    product_id: productId,
  } = hit;

  const customThc = `${percentThc}% THC`;
  const customName = rootSubtype ? `${name} (${customThc} - ${rootSubtype})` : `${name} (${customThc})`;

  const prices = availableWeights.map((weight) => {
    const convertToKey = `price_${weight.replace(/ /g, '_')}`;
    const price = hit[convertToKey];
    return price;
  });

  return {
    raw_name: name,
    root_subtype: rootSubtype,
    percent_thc: percentThc,
    custom_name: customName,
    brand_name: brandName,
    available_weights: availableWeights,
    sizes: availableWeights.join('/'),
    prices: prices.join('/'),
    product_id: productId,
  };
};
/**
 * Helper function to get flower by brand.
 * @param {String} brandName Brand name we want to query against.
 * @param {Number} storeId ID fo the store.
 * @returns Array of flowers by brand.
 */
const getFlowerForBrand = async (brandName, storeId) => {
  const config = {
    ...baseConfig,
    data: JSON.stringify({
      query: '',
      hitsPerPage: 16,
      filters: `store_id:${storeId} AND (brand:"${brandName}" AND kind:"${KIND}")`,
    }),
  };

  const results = await makeRequest(config);

  const { hits } = results;
  verboseLogger({ hitsLength: hits.length });
  verboseLogger({
    brandName,
  });

  const normalizedHits = hits.map((hit) => normalizeHit(hit, brandName));

  return normalizedHits;
};
/**
 * Helper function to get all brands by store id (dispensary).
 * @param {Number} storeId Store id that we are querying against.
 * @returns List of all brands that contain flower for this dispensary.
 */
const getAllBrandsForFlower = async (storeId) => {
  const data = JSON.stringify({
    query: '',
    filters: `store_id = ${storeId} AND (root_types:"flower")`,
    facets: ['*'],
  });

  const config = {
    ...baseConfig,
    data,
  };

  const results = await makeRequest(config);

  const {
    facets: { brand: brandObj },
  } = results;
  const brands = Object.keys(brandObj);
  verboseLogger({ brands });
  return brands;
};
/**
 * Helper function to get a product id using its store id.
 * @param {Number} productId Product ID we want to search against.
 * @param {Number} storeId Store ID we want to search against.
 * @returns Product details, if exists. Null if not.
 */
const getProductIdByStoreId = async (productId, storeId) => {
  const data = JSON.stringify({
    query: '',
    filters: `store_id = ${storeId} AND (product_id = ${productId})`,
  });

  const config = {
    ...baseConfig,
    data,
  };

  const results = await makeRequest(config);

  return results?.hits && Array.isArray(results.hits) && results.hits.length > 0 ? results.hits[0] : null;
};

module.exports = {
  getAllBrandsForFlower,
  getFlowerForBrand,
  getProductIdByStoreId,
  normalizeHit,
};

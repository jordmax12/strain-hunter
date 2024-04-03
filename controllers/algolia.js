const fs = require('fs');
const { makeRequest } = require('./request');
const { DEBUG_CONFIG, ROOT_AGOLIA_URL, STORE_MAPPER, STORE_ID, verboseLogger } = require('./config');

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
  const { percent_thc: percentThc, root_subtype: rootSubtype, available_weights: availableWeights, name } = hit;

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
  };
};
/**
 * Helper function to get flower by brand.
 * @param {String} brandName Brand name we want to query against.
 * @returns Array of flowers by brand.
 */
const getFlowerForBrand = async (brandName) => {
  const config = {
    ...baseConfig,
    data: JSON.stringify({
      query: '',
      hitsPerPage: 16,
      filters: `store_id:${STORE_ID} AND (brand:"${brandName}" AND kind:"${KIND}")`,
    }),
  };

  const results = await makeRequest(config);

  if (DEBUG_CONFIG.saveResults) {
    const dir = `./data/${STORE_ID}-${STORE_MAPPER[STORE_ID]}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(`${dir}/${brandName}.json`, JSON.stringify(results));
  }

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
 * @returns List of all brands that contain flower for this dispensary.
 */
const getAllBrandsForFlower = async () => {
  const data = JSON.stringify({
    query: '',
    filters: `store_id = ${STORE_ID} AND (root_types:"flower")`,
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

module.exports = {
  getAllBrandsForFlower,
  getFlowerForBrand,
  normalizeHit,
};

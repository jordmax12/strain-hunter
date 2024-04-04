const NATURES_CARE_STORE_ID = 1283;
const RISE_STORE_ID = 253;
const DEBUG_CONFIG = {
  logs: true,
  verbose: false,
  saveResults: false,
};

const ROOT_AGOLIA_URL = 'https://vfm4x0n23a-dsn.algolia.net/1/indexes/menu-products-production/query';

const STORE_ID = RISE_STORE_ID;

const STORE_MAPPER = {
  253: 'RISE (Mundelein)',
  1283: 'Natures Care (Rolling Meadows)',
};

// const TARGETS = [
//   {
//     strain_name: 'DAILY GRAPES',
//     brand: 'NEZ',
//     dispensary: RISE_STORE_ID,
//   },
//   {
//     strain_name: 'FRIED STRAWBERRIES',
//     brand: 'THE BOTANIST',
//     dispensary: NATURES_CARE_STORE_ID,
//   },
//   {
//     strain_name: 'LEMON BEAN',
//     brand: 'HIGH SUPPLY™',
//     dispensary: RISE_STORE_ID,
//   },
// ];
/**
 * Helper function to log if config setting is true.
 * @param {String} log Desired log message.
 * @returns Truthy result.
 */
const logger = (log) => DEBUG_CONFIG.logs && console.log(log);
/**
 * Helper function to perform a verbose log if verbose config setting is true.
 * @param {String} log Desired verbose log message.
 * @returns Truthy result.
 */
const verboseLogger = (log) => DEBUG_CONFIG.verbose && console.info(log);

module.exports = {
  DEBUG_CONFIG,
  ROOT_AGOLIA_URL,
  STORE_ID,
  STORE_MAPPER,
  // TARGETS,
  logger,
  verboseLogger,
};

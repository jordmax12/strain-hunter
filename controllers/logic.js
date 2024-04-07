const { STORE_MAPPER, logger, verboseLogger } = require('./config');
/**
 * Helper function to generate a log message based on normalized hit data.
 * @param {Object} normalizedHit Normalized hit object containing `name`, `brand_name`, `custom_name`,
 * `available_wegiths`, `root_subtype`, `prices`, `sizes` and `percent_thc`.
 * @param {String} phoneNumber Phone number of user.
 * @param {Number} storeId ID of the store.
 * @returns Formatted message ready to be logged.
 */
const generateMessageFromNormalizedHit = (normalizedHit, phoneNumber, storeId) => {
  const { brand_name: brandName, sizes, prices, custom_name: customName } = normalizedHit;

  return `\n\n*IN STOCK*\n
    name: ${customName} by ${brandName}\n
    dispensary: ${STORE_MAPPER[storeId]}\n
    sizes: ${sizes}\n
    prices: ${prices}\n
    user: ${phoneNumber}\n`;
};
/**
 * Helper function to perform logic on normalized hits.
 * @param {Array} normalizedHit Array of normalized hit objects containing `name`, `brand_name`, `custom_name`,
 * `available_wegiths`, `root_subtype`, `prices`, `sizes` and `percent_thc`.
 * @param {Number} dispensaryCode Code for dispensary.
 * @param {Array} targets Targets array from users table.
 * @param {String} phoneNumber Phone number of user.
 * @param {Number} storeId ID of the store.
 * @returns Targets that matched criteria to be tracked.
 */
const handleNormalizedHits = (normalizedHits, dispensaryCode, targets, phoneNumber, storeId) => {
  const findTargets = normalizedHits.reduce(
    (acc, normalizedHit) => {
      const {
        raw_name: name,
        brand_name: brandName,
        sizes,
        prices,
        root_subtype: rootSubtype,
        percent_thc: percentThc,
      } = normalizedHit;
      verboseLogger({
        name,
        brandName,
      });
      const find = targets.find(
        (target) =>
          target.strain_name === name.toUpperCase() &&
          target.brand === brandName.toUpperCase() &&
          target.dispensary === dispensaryCode
      );

      if (find) {
        const message = generateMessageFromNormalizedHit(normalizedHit, phoneNumber, storeId);
        acc.foundTargets.push({
          ...find,
          phone_number: phoneNumber,
          sizes,
          prices,
          root_subtype: rootSubtype,
          percent_thc: percentThc,
          message,
        });
        logger(message);
      }

      return acc;
    },
    { foundTargets: [] }
  );

  return findTargets.foundTargets;
};

module.exports = {
  handleNormalizedHits,
};

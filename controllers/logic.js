const { STORE_MAPPER, STORE_ID, TARGETS, logger, verboseLogger } = require('./config');
/**
 * Helper function to generate a log message based on normalized hit data.
 * @param {Object} normalizedHit Normalized hit object containing `name`, `brand_name`, `custom_name`,
 * `available_wegiths`, `root_subtype`, `prices`, `sizes` and `percent_thc`.
 * @returns Formatted message ready to be logged.
 */
const generateMessageFromNormalizedHit = (normalizedHit) => {
  const { brand_name: brandName, sizes, prices, custom_name: customName } = normalizedHit;

  return `\n\n*IN STOCK*\n
    name: ${customName} by ${brandName}\n
    dispensary: ${STORE_MAPPER[STORE_ID]}\n
    sizes: ${sizes}\n
    prices: ${prices}\n`;
};
/**
 * Helper function to perform logic on normalized hits.
 * @param {Array} normalizedHit Array of normalized hit objects containing `name`, `brand_name`, `custom_name`,
 * `available_wegiths`, `root_subtype`, `prices`, `sizes` and `percent_thc`.
 * @param {Number} dispensaryCode Code for dispensary.
 * @returns Targets that matched criteria to be tracked.
 */
const handleNormalizedHits = (normalizedHits, dispensaryCode) => {
  const findTargets = normalizedHits.reduce(
    (acc, normalizedHit) => {
      const { raw_name: name, brand_name: brandName } = normalizedHit;
      verboseLogger({
        name,
        brandName,
      });
      const find = TARGETS.find(
        (target) =>
          target.strain_name === name.toUpperCase() &&
          target.brand === brandName.toUpperCase() &&
          target.dispensary === dispensaryCode
      );

      if (find) {
        const message = generateMessageFromNormalizedHit(normalizedHit);
        acc.foundTargets.push(find);
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

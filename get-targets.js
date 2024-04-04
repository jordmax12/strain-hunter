const { getAllBrandsForFlower, getFlowerForBrand } = require('./controllers/algolia');
const { STORE_ID, logger } = require('./controllers/config');
const { handleNormalizedHits } = require('./controllers/logic');
const { generateTargetTrackerId, createTargetTracker } = require('./controllers/targets-tracker');
const { getAllUsers } = require('./controllers/users');

const handler = async () => {
  const users = await getAllUsers();
  // NOTE: this should be able to handle up to ~2500 users.
  // If this somehow scales past this we can figure that out later.
  // Can always segment lambdas out and keep track of state.
  const promises = users.map(async ({ phone_number: phoneNumber, targets }) => {
    const brands = await getAllBrandsForFlower();
    const flowerProductPromises = brands.map(async (brandName) => {
      const normalizedHits = await getFlowerForBrand(brandName);
      return normalizedHits;
    });

    const normalizedHits = await Promise.all(flowerProductPromises);

    const inStockTargets = handleNormalizedHits(normalizedHits.flat(), STORE_ID, targets, phoneNumber);

    logger({
      inStockTargets,
    });

    const targetTrackerPromises = inStockTargets.map(async (target) => {
      const { strain_name: strainName, dispensary, brand, sizes } = target;
      const targetTrackerId = generateTargetTrackerId(strainName, brand, dispensary, sizes, phoneNumber);
      logger({
        targetTrackerId,
      });

      await createTargetTracker(target, targetTrackerId, phoneNumber);

      return true;
    });

    await Promise.all(targetTrackerPromises);
  });

  await Promise.all(promises);

  return {
    statusCode: 200,
  };
};

module.exports = {
  handler,
};

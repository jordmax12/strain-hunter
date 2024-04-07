const { getAllBrandsForFlower, getFlowerForBrand } = require('./controllers/algolia');
const { sendSms } = require('./controllers/click-send');
const { logger } = require('./controllers/config');
const { handleNormalizedHits } = require('./controllers/logic');
const { generateTargetTrackerId, createTargetTracker } = require('./controllers/targets-tracker');
const { getAllUsers } = require('./controllers/users');

const handler = async () => {
  const users = await getAllUsers();
  // NOTE: this should be able to handle up to ~2500 users.
  // If this somehow scales past this we can figure that out later.
  // Can always segment lambdas out and keep track of state.
  const promises = users.map(async ({ phone_number: phoneNumber, targets }) => {
    console.log({
      targets,
    });
    const targetPromises = targets.map(async ({ dispensary: storeId }) => {
      const brands = await getAllBrandsForFlower(storeId);
      const flowerProductPromises = brands.map(async (brandName) => {
        const normalizedHits = await getFlowerForBrand(brandName, storeId);
        return normalizedHits;
      });

      const normalizedHits = await Promise.all(flowerProductPromises);

      const inStockTargets = await handleNormalizedHits(normalizedHits.flat(), storeId, targets, phoneNumber, storeId);

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

        // await sendSms(`New update for ${brand} (${strainName})! Check your email`, phoneNumber);
        // NOTE: so this works, the `message` is too spam-y for carriers. It will get rejected.
        // We can send that message in an email instead and/or discord message.

        return true;
      });

      await Promise.all(targetTrackerPromises);
    });

    await Promise.all(targetPromises);
    return true;
  });

  await Promise.all(promises);

  return {
    statusCode: 200,
  };
};

module.exports = {
  handler,
};

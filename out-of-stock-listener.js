const { getProductIdByStoreId } = require('./controllers/algolia');
const { getAllTargets, deleteTargetTracker } = require('./controllers/targets-tracker');
const { createTargetTrackerArchive } = require('./controllers/targets-tracker-archive');

const handler = async () => {
  const targets = await getAllTargets();

  const promises = targets.map(async (target) => {
    const { tracker_obj: trackerObj, product_id: productId, user_id: userId, id: targetId } = target;

    const { dispensary } = trackerObj;

    const productInfo = await getProductIdByStoreId(productId, dispensary);

    if (!productInfo) {
      console.info('OUT OF STOCK DETECTED', productId);
      await createTargetTrackerArchive({ ...trackerObj, target_id: targetId }, target, userId);
      await deleteTargetTracker(targetId, userId);
    }

    return true;
  });

  await Promise.all(promises);

  return {
    statusCode: 200,
  };
};

module.exports = { handler };

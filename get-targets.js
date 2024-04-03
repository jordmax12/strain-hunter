const { getAllBrandsForFlower, getFlowerForBrand } = require('./controllers/algolia');
const { STORE_ID } = require('./controllers/config');
const { handleNormalizedHits } = require('./controllers/logic');

const handler = async () => {
  const brands = await getAllBrandsForFlower();
  const flowerProductPromises = brands.map(async (brandName) => {
    const normalizedHits = await getFlowerForBrand(brandName);
    return normalizedHits;
  });

  const normalizedHits = await Promise.all(flowerProductPromises);

  const inStockTargets = handleNormalizedHits(normalizedHits.flat(), STORE_ID);

  console.log({
    inStockTargets,
  });

  return {
    statusCode: 200,
  };
};

module.exports = {
  handler,
};

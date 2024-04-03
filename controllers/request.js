const axios = require('axios');
/**
 * Helper function to make a request using axios.
 * @param {Object} config Axios config for request.
 * @returns Will return data if request succeeded and data exists, otherwise will return null and will log the error.
 */
const makeRequest = async (config) => {
  try {
    const response = await axios(config);
    return response?.data;
  } catch (e) {
    console.log('logging error!');
    console.log(config);
    return null;
  }
};

module.exports = {
  makeRequest,
};

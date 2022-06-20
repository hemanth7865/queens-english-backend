const configs = require("./../configs/index");
const axios = require("axios");

axios.defaults.baseURL = configs.API_URL;

const handleAPI = async (callback, success = false, fail = false) => {
  try {
    if (success) {
      return await success(await callback());
    } else {
      return (await callback()).data;
    }
  } catch (e) {
    if (fail) {
      await fail(e);
    }

    return e;
  }
};

module.exports = axios;

module.exports.handleAPI = handleAPI;

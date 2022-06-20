const generateToken = require("./helpers/generateToken");
const axios = require("./helpers/axios");
const { listUsers } = require("./helpers/userMethods");

class ZoomAPI {
  APIKey;
  APISecret;
  JWTToken;
  axios = axios;
  constructor(APIKey, APISecret) {
    this.APIKey = APIKey;
    this.APISecret = APISecret;
  }

  handleAPI = axios.handleAPI;

  generateToken = () => {
    this.JWTToken = generateToken(this.APIKey, this.APISecret);
    return this;
  };

  initAxios = () => {
    this.axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${this.JWTToken}`;
  };

  init = async () => {
    this.generateToken();
    this.initAxios();
    const data = await this.listUsers();
    console.log(this.JWTToken, data);
    return this;
  };
}

ZoomAPI.prototype.listUsers = listUsers;

exports.ZoomAPI = ZoomAPI;

const generateToken = require("./helpers/generateToken");
const axios = require("./helpers/axios");
const { listUsers, createUser } = require("./helpers/userMethods");

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
    return this;
  };
}

ZoomAPI.prototype.listUsers = listUsers;
ZoomAPI.prototype.createUser = createUser;

exports.ZoomAPI = ZoomAPI;

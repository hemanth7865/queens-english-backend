const generateToken = require("./helpers/generateToken");
const axios = require("./helpers/axios");
const {
  listUsers,
  createUser,
  checkUserEmail,
  listUserMeetings,
  createUserMeeting,
} = require("./helpers/userMethods");

class ZoomAPI {
  APIKey;
  APISecret;
  JWTToken;
  axios = axios;
  method;
  constructor(APIKey, APISecret) {
    this.APIKey = APIKey;
    this.APISecret = APISecret;
  }

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

  handleAPISuccess = async (data) => {
    return data.data;
  };

  handleAPIError = async (data) => {
    return data.response.data;
  };
}

ZoomAPI.prototype.listUsers = listUsers;
ZoomAPI.prototype.createUser = createUser;
ZoomAPI.prototype.checkUserEmail = checkUserEmail;
ZoomAPI.prototype.listUserMeetings = listUserMeetings;
ZoomAPI.prototype.createUserMeeting = createUserMeeting;
ZoomAPI.prototype.handleAPI = axios.handleAPI;

exports.ZoomAPI = ZoomAPI;

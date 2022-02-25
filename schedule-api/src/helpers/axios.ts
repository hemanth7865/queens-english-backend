import axios from "axios";

// instance.defaults.headers.common["idtoken"] = process.env.USER_ID_TOKEN;

const instance = axios.create({
  baseURL: process.env.URL,
  params: {
    code: process.env.CODE,
  },
});

export default instance;

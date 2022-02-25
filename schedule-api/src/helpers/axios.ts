import axios from "axios";

const instance = axios.create({
  baseURL: process.env.URL,
  params: {
    code: process.env.CODE,
  },
});

instance.defaults.headers.common["idtoken"] = process.env.USER_ID_TOKEN;

export default instance;

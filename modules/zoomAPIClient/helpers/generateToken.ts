const jwt = require("jsonwebtoken");

const generateToken = (API_KEY: string, API_SECRET: string) => {
  const payload = {
    iss: API_KEY,
    exp: new Date().getTime() + 50000,
  };

  const token = jwt.sign(payload, API_SECRET);
  return token;
};

export default generateToken;

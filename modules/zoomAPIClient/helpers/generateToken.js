"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const generateToken = (API_KEY, API_SECRET) => {
    const payload = {
        iss: API_KEY,
        exp: new Date().getTime() + 50000,
    };
    const token = jwt.sign(payload, API_SECRET);
    return token;
};
exports.default = generateToken;
//# sourceMappingURL=generateToken.js.map
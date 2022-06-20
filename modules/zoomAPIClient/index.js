"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateToken_1 = require("./helpers/generateToken");
class ZoomAPI {
    constructor(APIKey, APISecret) {
        this.generateToken = () => {
            this.JWTToken = (0, generateToken_1.default)(this.APIKey, this.APISecret);
            return this;
        };
        this.init = () => {
            this.generateToken();
            console.log(this.JWTToken, "changed");
            return this;
        };
        this.APIKey = APIKey;
        this.APISecret = APISecret;
    }
}
exports.ZoomAPI = ZoomAPI;
//# sourceMappingURL=index.js.map
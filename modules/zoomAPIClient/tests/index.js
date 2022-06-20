"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./../configs/index");
const { ZoomAPI } = require("./../index.ts");
const { APIKey, APISecret } = index_1.default;
const zoomClient = new ZoomAPI(APIKey, APISecret);
zoomClient.init();
console.log(ZoomAPI, zoomClient);
//# sourceMappingURL=index.js.map
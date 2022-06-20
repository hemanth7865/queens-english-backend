import configs from "./../configs/index";
const { ZoomAPI } = require("./../index.ts");

const { APIKey, APISecret } = configs;
const zoomClient = new ZoomAPI(APIKey, APISecret);
zoomClient.init();
console.log(ZoomAPI, zoomClient);

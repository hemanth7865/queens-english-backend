require("dotenv").config({ path: "./../../schedule-api/.env" });
const { ZoomAPI } = require("./../index");

const { ZOOM_API_KEY, ZOOM_API_SECRET } = process.env;

const test = async () => {
  const zoomClient = new ZoomAPI(ZOOM_API_KEY, ZOOM_API_SECRET);
  zoomClient.init();
  console.log(await zoomClient.listUsers());
};

test();

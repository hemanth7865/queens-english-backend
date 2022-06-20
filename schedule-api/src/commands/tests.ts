require("dotenv").config({ path: "./../../.env" });
const { ZoomAPI } = require("zoomAPIClient");

const { ZOOM_API_KEY, ZOOM_API_SECRET } = process.env;

const test = async () => {
  const zoomClient = new ZoomAPI(ZOOM_API_KEY, ZOOM_API_SECRET);

  zoomClient.init();
};

test();

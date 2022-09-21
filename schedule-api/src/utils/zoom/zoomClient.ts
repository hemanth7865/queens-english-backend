const { ZoomAPI } = require("zoom-api-client");

const { ZOOM_API_KEY, ZOOM_API_SECRET } = process.env;

const zoomClient = new ZoomAPI({
  APIKey: ZOOM_API_KEY,
  APISecret: ZOOM_API_SECRET,
});

zoomClient.init();

export default zoomClient;

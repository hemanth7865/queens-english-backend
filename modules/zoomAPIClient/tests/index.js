require("dotenv").config({ path: "./../../schedule-api/.env" });
const { ZoomAPI } = require("./../index");
const { createUserSample } = require("./../helpers/userMethods/createUser");
const {
  createUserMeetingSample,
} = require("./../helpers/userMethods/createUserMeeting");

const { ZOOM_API_KEY, ZOOM_API_SECRET } = process.env;

const test = async () => {
  const zoomClient = new ZoomAPI(ZOOM_API_KEY, ZOOM_API_SECRET);
  zoomClient.init();
  const users = await zoomClient.listUsers();
  const createUserMeeting = await zoomClient.createUserMeeting(
    "QgzHBdJpTtGF1XwqNJejsw",
    createUserMeetingSample
  );
  console.log(createUserMeeting);
};

test();

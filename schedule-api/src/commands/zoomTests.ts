require("dotenv").config({ path: "./.env" });
import { createConnection } from "typeorm";
import { ZoomUserService } from "../services/ZoomUsersService";
import { ZoomUser } from "./../entity/ZoomUser";

const { ZoomAPI } = require("zoomAPIClient");

const { ZOOM_API_KEY, ZOOM_API_SECRET } = process.env;

createConnection().then(async (r) => {
  const zoomClient = new ZoomAPI(ZOOM_API_KEY, ZOOM_API_SECRET);

  zoomClient.init();

  const zoomUserService = new ZoomUserService();

  zoomClient.setUser({ id: "uJP0VnmySUW553pEc6T0Aw" });

  const teachers = await zoomUserService.getTeachersWithoutLicense();

  if (Array.isArray(teachers)) {
    for (let teacher of teachers) {
      const zoomUser = new ZoomUser();
      zoomUser.user_id = teacher.id;
      const createdUser = await zoomClient.createCustUser({
        email: `${zoomUser.user_id}@queensenglish.co`,
        type: 2,
        first_name: teacher.firstName,
        last_name: teacher.lastName,
      });
      if (createdUser.id) {
        zoomUser.id = createdUser.id;
        zoomUser.first_name = createdUser.first_name;
        zoomUser.last_name = createdUser.last_name;
        zoomUser.email = createdUser.email;
        zoomUser.type = createdUser.type;
        zoomUser.created_at = new Date();
        zoomUser.updated_at = new Date();
        const createdSQLUser = await zoomUserService.updateCreateZoomUser(
          zoomUser
        );
        console.log(teacher, createdUser);
      } else {
        console.log(teacher, createdUser, "done");
        break;
      }
    }
  } else {
    console.log(teachers, Array.isArray(teachers));
  }
});

const test = async () => {
  return "hello";
};

test();

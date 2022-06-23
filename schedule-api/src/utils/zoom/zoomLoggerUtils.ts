import { ZoomUser } from "../../entity/ZoomUser";
import { User } from "../../entity/User";
const log = async (
  oldRecord: {
    zoomUser?: ZoomUser;
    user?: User;
  },
  newRecord: {
    zoomUser: ZoomUser | any;
    user: User;
  },
  user: any
): Promise<object> => {
  let title = "";
  let event = "";
  const bot = user?.email ? false : true;
  const create = oldRecord?.zoomUser?.id ? false : true;

  if (bot) {
    user = {
      email: "System Bot.",
    };
    title = "Bot Action, ";
  } else {
    title = "User Action, ";
  }

  if (create) {
    title += "Created Record, ";
  } else {
    title += "Updated Record, ";
  }

  if (bot && create) {
    event = "CREATE_ZOOM_USER_BOT";
  } else if (create) {
    event = "CREATE_ZOOM_USER";
  } else if (bot && !create) {
    event = "UPDATE_ZOOM_USER_BOT";
  } else if (!create) {
    event = "UPDATE_ZOOM_USER";
  }

  if (newRecord.zoomUser?.message) {
    title += newRecord.zoomUser?.message + ", ";
  }

  title = title.substring(0, title.length - 2) + ".";

  return {
    title,
    event,
    debug: { oldRecord, newRecord, user },
  };
};

export default log;

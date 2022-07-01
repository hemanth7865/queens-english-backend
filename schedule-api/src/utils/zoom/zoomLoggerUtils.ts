import { ZoomUser } from "../../entity/ZoomUser";
import { ZoomMeeting } from "../../entity/ZoomMeeting";
import { User } from "../../entity/User";
const log = async (
  oldRecord: {
    zoomUser?: ZoomUser;
    zoomMeeting?: ZoomMeeting;
    user?: User | any;
  },
  newRecord: {
    zoomUser: ZoomUser | any;
    zoomMeeting?: ZoomMeeting | any;
    user?: User | any;
  },
  user: any
): Promise<object> => {
  let title = "";
  let event = "";
  const bot = user?.email ? false : true;
  const createUser = oldRecord?.zoomUser?.id ? false : true;
  const createMetting = oldRecord?.zoomMeeting?.id ? false : true;

  if (bot) {
    user = {
      email: "System Bot.",
    };
    title = "Bot Action, ";
  } else {
    title = "User Action, ";
  }

  if (createUser || createMetting) {
    title += "Created Record, ";
  } else {
    title += "Updated Record, ";
  }

  if (createMetting) {
    event = "CREATE_ZOOM_MEETING";
  } else if (createUser) {
    event = "CREATE_ZOOM_USER";
  } else {
    if (newRecord.zoomMeeting) {
      event = "UPDATE_ZOOM_USER_MEETING";
    } else {
      event = "UPDATE_ZOOM_USER";
    }
  }

  if (bot) {
    event += "_BOT";
  }

  if (newRecord.zoomUser?.message) {
    title += newRecord.zoomUser?.message + ", ";
  }

  if (newRecord.zoomMeeting?.message) {
    title += newRecord.zoomMeeting?.message + ", ";
  }

  title = title.substring(0, title.length - 2) + ".";

  return {
    title,
    event,
    debug: { oldRecord, newRecord, user },
  };
};

export default log;

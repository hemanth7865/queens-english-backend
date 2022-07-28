//import { Lead } from "./Lead";

import { BatchAvailability } from "../entity/BatchAvailability";
import { BatchStudent } from "../entity/BatchStudent";
import { Classes } from "../entity/Classes";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { ZoomUser } from "../entity/ZoomUser";
import { TeacherAvailability } from "../entity/TeacherAvailability";

export class TeacherView {
  classes: Classes;
  batchAvailability: BatchAvailability[];
  students: BatchStudent[];
  zoomMeeting: ZoomMeeting;
  zoomUser: ZoomUser;
  TeacherView() {}
}

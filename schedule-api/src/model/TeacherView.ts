//import { Lead } from "./Lead";

import { BatchAvailability } from "../entity/BatchAvailability";
import { BatchStudent } from "../entity/BatchStudent";
import { Classes } from "../entity/Classes";
import { TeacherAvailability } from "../entity/TeacherAvailability";

export class TeacherView {
    classes: Classes;
    batchAvailability: BatchAvailability[];;
    students: BatchStudent[];
    TeacherView() {

    }

}

export enum OperationTypes {
  NONE = "",
  reassignEq = "reassign-eq",
  reassignSchool = "reassign-school",
  rescheduleEq = "reschedule-eq",
  rescheduleSchool = "reschedule-school",
  checkIn = "checkIn",
  changeAssessmentStatus = "change-assessment-status",
  changeActiveLesson = "change-active-lesson"
}

export const EVENT_CODE_OPERATIONS = {
  REASSIGN_EQ: {
    code: "001",
    operation: "Reassign - EQ",
  },
  REASSIGN_SCHOOL: {
    code: "002",
    operation: "Reassign - School",
  },
  RESCHEDULE_EQ: {
    code: "003",
    operation: "Reschedule - EQ",
  },
  RESCHEDULE_SCHOOL: {
    code: "004",
    operation: "Reschedule - School",
  },
  CHECKIN: {
    code: "005",
    operation: "CheckIn",
  },
  CHANGE_ACTIVE_LESSON: {
    code: "006",
    operation: "Change Active Lesson",
  },
  CHANGE_ASSESSMENT_STATUS: {
    code: "007",
    operation: "Change Assessment Status",
  },
  DEFAULT: {
    code: "",
    operation: "",
  },
} as const;

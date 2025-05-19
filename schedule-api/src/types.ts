export enum OperationTypes {
  NONE = "",
  reassignEq = "reassign-eq",
  reassignSchool = "reassign-school",
  rescheduleEq = "reschedule-eq",
  rescheduleSchool = "reschedule-school",
  checkIn = "checkIn",
  changeAssessmentStatus = "change-assessment-status",
  changeActiveLesson = "change-active-lesson",
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

export enum SchoolStage {
  ReadyForContract = "Ready for contract",
  ToBeOnBoarded = "To be On Boarded",
  FirstTrainingScheduled = "First training scheduled",
  FirstTrainingCompleted = "First training completed",
  TrainingScheduled = "Training scheduled",
  TrainingCompleted = "Training completed",
  BatchesCreated = "Batches Created",
  ClassPartiallyStarted = "Class partially started",
  ClassFullyStarted = "Class fully started",
  OnBoarded = "On Boarded",
}

export enum LeadCategory {
  RENEWAL = "Renewal",
  NEW_SALE = "New Sale",
}

export enum SchoolStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export enum ContractStatus {
  NotSigned = "not signed",
  Signed = "signed",
  Approved = "approved",
}

export enum InitialPaymentStatus {
  Received = "received",
  Unpaid = "unpaid",
  Paid = "paid",
}

export interface SchoolEditableProps {
  schoolName?: string;
  schoolCode?: string;
  locationCode?: string;
  schoolStatus?: SchoolStatus;
  poc?: string;
  country?: string;
  territory?: string;
  state?: string;
  city?: string;
  startDate?: Date | string;
  mapLocationURL?: string;
  sraId?: string;
  hasTVForITTs?: boolean;
  teacherCount?: number;
  studentCount?: number;
  paidDate?: Date | string;
  leadCategory?: LeadCategory;
  booksDate?: Date | string;
  expectedPrice: number;
  initialAmount: number;
  paymentType: "partial" | "full";
  paymentCycle: number;
  pdfViewAccess: boolean;
  assessmentsEnabled: boolean;
  isFreeSpeakingActivityEnabled: boolean;
  isAssessmentStudentModeEnabled: boolean;
  initialPaymentStatus: InitialPaymentStatus;
  contractStatus: ContractStatus;
  television_cost?: number;
  bluetooth_speaker_cost?: number;
  batches?: {
    [key: string]: any;
  };
}

export enum PackageName {
  Gold = "Gold",
  Diamond = "Diamond",
  Platinum = "Platinum",
}

export enum FeatureName {
  INITIAL_TEACHER_TRAINING = "INITIAL TEACHER TRAINING",
  SCHOOL_VISITS_PER_MONTH = "SCHOOL VISITS (PER MONTH)",
  ACTIVITY_BOOKS = "ACTIVITY BOOKS",
  ACCESS_TO_TEACHER_APP = "ACCESS TO TEACHER APP",
  MONTHLY_TEACHER_PROFESSIONAL_DEVELOPMENT_SESSIONS = "MONTHLY TEACHER PROFESSIONAL DEVELOPMENT SESSIONS",
  ACCESS_TO_STUDENT_APP = "ACCESS TO STUDENT APP",
  UK_US_EXPERT_TRAINER_WORKSHOPS = "UK/US EXPERT TRAINER WORKSHOPS",
  INTERNATIONAL_CERTIFICATE_FOR_STUDENTS = "INTERNATIONAL CERTIFICATE FOR STUDENTS",
  INTERNATIONAL_TEACHER_TRAINING_PROGRAM = "INTERNATIONAL TEACHER TRAINING PROGRAM",
  LEADERSHIP_PLUS_PROGRAM_FORSCHOOL_MANAGEMENT = "LEADERSHIP PLUS PROGRAM FORSCHOOL MANAGEMENT",
}

import { LoginController } from "./controller/LoginController";
import { UserController } from "./controller/UserController";
import { BatchController } from "./controller/BatchController";
import { SessionController } from "./controller/SessionController";
import { AssessmentController } from "./controller/AssessmentController";
import { Assessment } from "./entity/Assessment";
import { LQSController } from "./controller/LQSController";
import { PaymentController } from "./controller/PaymentController";

export const Routes = [
  {
    method: "post",
    route: "/login",
    controller: LoginController,
    action: "login",
  },
  {
    method: "get",
    route: "/logout",
    controller: LoginController,
    action: "logout",
  },
  {
    method: "get",
    route: "/lessons",
    controller: UserController,
    action: "lessons",
    // authenticate:true
  },
  {
    method: "get",
    route: "/currentUser",
    controller: LoginController,
    action: "currentUser",
  },
  {
    method: "get",
    route: "/leads",
    controller: UserController,
    action: "allLeads",
  },
  {
    method: "post",
    route: "/leads/csv",
    controller: UserController,
    action: "updateStudentsCSV",
  },
  {
    method: "post",
    route: "/leads/csv/v2",
    controller: UserController,
    action: "updateStudentsCSVV2",
  },
  {
    method: "get",
    route: "/leadsView",
    controller: UserController,
    action: "listLeadDetails",
  },
  {
    method: "get",
    route: "/leadsFullView/:id",
    controller: UserController,
    action: "leadFullDetails",
  },
  {
    method: "get",
    route: "/student/active/batches/:id",
    controller: UserController,
    action: "getStudentActiveBatches",
  },
  {
    method: "post",
    route: "/leads",
    controller: UserController,
    action: "saveLeads",
  },
  {
    method: "post",
    route: "/leads/update/status",
    controller: UserController,
    action: "updateLeadsStatus",
  },
  {
    method: "post",
    route: "/retryLSQFailedRecords",
    controller: LQSController,
    action: "retryLSQFailedRecords",
  },
  {
    method: "post",
    route: "/fetchLQSData",
    controller: LQSController,
    action: "updateLQSData",
  },
  {
    method: "get",
    route: "/filterLead",
    controller: UserController,
    action: "filterLeadDetails",
  },
  {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove",
  },
  {
    method: "delete",
    route: "/batch/:id",
    controller: BatchController,
    action: "remove",
  },
  {
    method: "post",
    route: "/createBatch",
    controller: BatchController,
    action: "createBatch",
  },
  {
    method: "post",
    route: "/re-batch",
    controller: BatchController,
    action: "reBatch",
  },
  {
    method: "post",
    route: "/update-batch-zoom-info-csv",
    controller: BatchController,
    action: "updateBatchZoomInfoAndWACSV",
  },
  {
    method: "delete",
    route: "/deleteBatch/:id",
    controller: BatchController,
    action: "deleteBatch",
  },
  {
    method: "get",
    route: "/listBatch",
    controller: BatchController,
    action: "listBatch",
  },
  {
    method: "get",
    route: "/listclass",
    controller: BatchController,
    action: "getClasses",
  },
  {
    method: "get",
    route: "/runBatchJob",
    controller: BatchController,
    action: "runBatchJob",
  },
  {
    method: "get",
    route: "/listBatch/:id",
    controller: BatchController,
    action: "getBatchDetails",
  },
  {
    method: "delete",
    route: "/batch/:id",
    controller: BatchController,
    action: "remove",
  },
  {
    method: "post",
    route: "/createBatch",
    controller: BatchController,
    action: "createBatch",
  },
  {
    method: "post",
    route: "/updateAllBatchesAgeGroup",
    controller: BatchController,
    action: "updateAllBatchesAgeGroup",
  },
  {
    method: "get",
    route: "/listBatch",
    controller: BatchController,
    action: "listBatch",
  },
  {
    method: "get",
    route: "/session/:id",
    controller: SessionController,
    action: "getSessionDetail",
    authenticate: true
  },
  {
    method: "get",
    route: "/session/batch/:id",
    controller: SessionController,
    action: "getBatchSessions",
    authenticate: true
  },
  {
    method: "get",
    route: "/session/batch/:id/:lessonId",
    controller: SessionController,
    action: "getBatchLessonSession",
    authenticate: true
  },
  {
    method: "get",
    route: "/session",
    controller: SessionController,
    action: "getSessions",
    authenticate: true
  },
  {
    method: "post",
    route: "/session",
    controller: SessionController,
    action: "createSession",
    authenticate: true
  },
  {
    method: "put",
    route: "/session/:id",
    controller: SessionController,
    action: "updateSession",
    authenticate: true
  },

  {
    method: "get",
    route: "/assessment/batch/:id",
    controller: AssessmentController,
    action: "getBatchAssessments",
    authenticate: true
  },
  {
    method: "get",
    route: "/assessment",
    controller: AssessmentController,
    action: "getAssessments",
    authenticate: true
  },
  {
    method: "put",
    route: "/assessment/:id",
    controller: AssessmentController,
    action: "updateAssessment",
    authenticate: true
  },
  {
    method: "get",
    route: "/assessment/:id",
    controller: AssessmentController,
    action: "getAssessmentDetail",
    authenticate: true
  },
  {
    method: "post",
    route: "/availableTeachers",
    controller: UserController,
    action: "availableTeachers",
    authenticate: true
  },

  {
    method: "get",
    route: "/loadTeacherAvailability",
    controller: UserController,
    action: "loadTeacherAvailability",
  },

  
  {
    method: "get",
    route: "/studentPaymentDetails",
    controller: PaymentController,
    action: "studentPaymentDetails",
  },
  
  {
    method: "post",
    route: "/paymentsDetails",
    controller: PaymentController,
    action: "loadTeacherAvailability",
  },

  {
    method: "post",
    route: "/fetchPaymentsDetails",
    controller: PaymentController,
    action: "loadTeacherAvailability",
  },
  
];

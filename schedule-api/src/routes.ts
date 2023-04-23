import { LoginController } from "./controller/LoginController";
import { UserController } from "./controller/UserController";
import { BatchController } from "./controller/BatchController";
import { SessionController } from "./controller/SessionController";
import { AssessmentController } from "./controller/AssessmentController";
import { InstallmentController } from "./controller/InstallmentController";
import { LQSController } from "./controller/LQSController";
import { PaymentController } from "./controller/PaymentController";
import { AzureProxyController } from "./controller/AzureProxyController";
import { ZoomController } from "./controller/ZoomController";
import { CollectionAgentController } from "./controller/CollectionAgentController";
import { LogsProxyController } from "./controller/LogsProxyController";
import { SchoolController } from "./controller/SchoolController";
import { UploadFilesController } from "./controller/UploadFilesController";

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
    authenticate: true,
  },
  {
    method: "get",
    route: "/currentUser",
    controller: LoginController,
    action: "currentUser",
    authenticate: true,
  },
  {
    method: "get",
    route: "/leads",
    controller: UserController,
    action: "allLeads",
    authenticate: true,
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
    method: "post",
    route: "/leads/csv/CE",
    controller: UserController,
    action: "updateStudentsCollectionExpertsCSV",
  },
  {
    method: "get",
    route: "/leadsView",
    controller: UserController,
    action: "listLeadDetails",
    authenticate: true,
  },
  {
    method: "get",
    route: "/leadsFullView/:id",
    controller: UserController,
    action: "leadFullDetails",
    authenticate: true,
  },
  {
    method: "get",
    route: "/student/active/batches/:id",
    controller: UserController,
    action: "getStudentActiveBatches",
    authenticate: true,
  },
  {
    method: "post",
    route: "/leads",
    controller: UserController,
    action: "saveLeads",
    authenticate: true,
  },
  {
    method: "post",
    route: "/leads/update/status",
    controller: UserController,
    action: "updateLeadsStatus",
    authenticate: true,
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
    authenticate: true,
  },
  {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove",
    authenticate: true,
  },
  {
    method: "delete",
    route: "/batch/:id",
    controller: BatchController,
    action: "remove",
    authenticate: true,
  },
  {
    method: "post",
    route: "/createBatch",
    controller: BatchController,
    action: "createBatch",
    authenticate: true,
  },
  {
    method: "post",
    route: "/re-batch",
    controller: BatchController,
    action: "reBatch",
    authenticate: true,
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
    authenticate: true,
  },
  {
    method: "get",
    route: "/listclass",
    controller: BatchController,
    action: "getClasses",
    authenticate: true,
  },
  {
    method: "get",
    route: "/runBatchJob",
    controller: BatchController,
    action: "runBatchJob",
  },
  {
    method: "get",
    route: "/listCosmosBatch/:id",
    controller: BatchController,
    action: "getCosmosBatch",
    authenticate: true,
  },
  {
    method: "get",
    route: "/listBatch/:id",
    controller: BatchController,
    action: "getBatchDetails",
    authenticate: true,
  },
  {
    method: "delete",
    route: "/batch/:id",
    controller: BatchController,
    action: "remove",
    authenticate: true,
  },
  {
    method: "post",
    route: "/createBatch",
    controller: BatchController,
    action: "createBatch",
    authenticate: true,
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
    authenticate: true,
  },
  {
    method: "get",
    route: "/session/:id",
    controller: SessionController,
    action: "getSessionDetail",
    authenticate: true,
  },
  {
    method: "get",
    route: "/session/batch/:id",
    controller: SessionController,
    action: "getBatchSessions",
    authenticate: true,
  },
  {
    method: "get",
    route: "/session/batch/:id/:lessonId",
    controller: SessionController,
    action: "getBatchLessonSession",
    authenticate: true,
  },
  {
    method: "get",
    route: "/session",
    controller: SessionController,
    action: "getSessions",
    authenticate: true,
  },
  {
    method: "post",
    route: "/session",
    controller: SessionController,
    action: "createSession",
    authenticate: true,
  },
  {
    method: "put",
    route: "/session/:id",
    controller: SessionController,
    action: "updateSession",
    authenticate: true,
  },

  {
    method: "get",
    route: "/assessment/batch/:id",
    controller: AssessmentController,
    action: "getBatchAssessments",
    authenticate: true,
  },
  {
    method: "get",
    route: "/assessment",
    controller: AssessmentController,
    action: "getAssessments",
    authenticate: true,
  },
  {
    method: "put",
    route: "/assessment/:id",
    controller: AssessmentController,
    action: "updateAssessment",
    authenticate: true,
  },
  {
    method: "get",
    route: "/assessment/:id",
    controller: AssessmentController,
    action: "getAssessmentDetail",
    authenticate: true,
  },
  {
    method: "post",
    route: "/availableTeachers",
    controller: UserController,
    action: "availableTeachers",
    authenticate: true,
  },
  {
    method: "get",
    route: "/loadTeacherAvailability",
    controller: UserController,
    action: "loadTeacherAvailability",
    authenticate: true,
  },
  {
    method: "post",
    route: "/update-installment-status",
    controller: InstallmentController,
    action: "updateTransctionPaymentStatus",
    apiKey: false,
  },
  {
    method: "get",
    route: "/studentPaymentDetails",
    controller: PaymentController,
    action: "studentPaymentDetails",
    authenticate: true,
  },

  {
    method: "post",
    route: "/paymentDetails",
    controller: PaymentController,
    action: "paymentDetails",
    authenticate: true,
  },

  {
    method: "post",
    route: "/generateBulkPaymentLinks",
    controller: PaymentController,
    action: "generateBulkPaymentLinks",
    // authenticate: true
  },

  {
    method: "post",
    route: "/fetchPaymentsDetails",
    controller: PaymentController,
    action: "loadTeacherAvailability",
    authenticate: true,
  },

  {
    method: "get",
    route: "/fetchCollectionAgent",
    controller: PaymentController,
    action: "fetchCollectionAgent",
    authenticate: true,
  },

  {
    method: "post",
    route: "/regeneratePaymentLink",
    controller: PaymentController,
    action: "regeneratePaymentLink",
    authenticate: true,
  },

  {
    method: "post",
    route: "/resetExpiredPayments",
    controller: PaymentController,
    action: "resetExpiredPayments",
    //authenticate: true,
  },

  {
    method: "post",
    route: "/fetchAutoDebitDetails",
    controller: PaymentController,
    action: "fetchAutoDebitDetails",
    // authenticate: true,
  },

  {
    method: "post",
    route: "/updateAutoDebitStatus",
    controller: PaymentController,
    action: "updateAutoDebitStatus",
    // authenticate: true,
  },

  {
    method: "post",
    route: "/retryAutoDebitPayment",
    controller: PaymentController,
    action: "retryAutoDebitPayment",
    // authenticate: true,
  },

  {
    method: "post",
    route: "/verifyDownPayment",
    controller: PaymentController,
    action: "verifyDownPayment",
    // authenticate: true,
  },

  {
    method: "post",
    route: "/uploadNetBankingResource",
    controller: PaymentController,
    action: "uploadNetBankingResource",
    // authenticate: true
  },
  {
    method: "all",
    route: "/azure",
    controller: AzureProxyController,
    action: "serve",
    authenticate: true,
  },
  {
    method: "all",
    route: "/fileProxy",
    controller: AzureProxyController,
    action: "fileProxy",
    authenticate: true,
  },
  {
    method: "post",
    route: "/upload/images",
    controller: UploadFilesController,
    action: "uploadImages",
    authenticate: true,
  },

  /**
   * Start API/Tests For Zoom
   */
  {
    method: "get",
    route: "/zoom-users/without-license",
    controller: ZoomController,
    action: "getTeachersWithoutLicense",
    // authenticate: true,
  },
  {
    method: "get",
    route: "/zoom-users/active-without-license",
    controller: ZoomController,
    action: "getActiveTeachersWithoutLicense",
    // authenticate: true,
  },
  {
    method: "get",
    route: "/zoom-meetings/active-batches-without-meeting",
    controller: ZoomController,
    action: "getActiveBatchesWithoutZoomLink",
    // authenticate: true,
  },
  {
    method: "get",
    route: "/zoom-meetings/batches-without-meeting",
    controller: ZoomController,
    action: "getBatchesWithoutZoomLink",
    // authenticate: true,
  },

  /**
   * Generators
   */
  // generate license for all teachers
  {
    method: "post",
    route: "/zoom-users/generate-license",
    controller: ZoomController,
    action: "generateTeachersLicense",
    // authenticate: true,
  },
  // generate license for teachers with active batches
  {
    method: "post",
    route: "/zoom-users/generate-active-license",
    controller: ZoomController,
    action: "generateActiveTeachersLicense",
    // authenticate: true,
  },
  {
    method: "post",
    route: "/zoom-meetings/active-batches-generate-meetings",
    controller: ZoomController,
    action: "generateActiveBatchesZoomLink",
    // authenticate: true,
  },
  {
    method: "get",
    route: "/zoom-users/delete-all-license",
    controller: ZoomController,
    action: "deleteAllTeachersLicense",
    // authenticate: true,
  },

  /**
   * End API/TESTS For Zoom
   */

  {
    method: "get",
    route: "/zoom-users",
    controller: ZoomController,
    action: "listZoomUsers",
    authenticate: true,
  },
  {
    method: "get",
    route: "/zoom-user/:id",
    controller: ZoomController,
    action: "showZoomUser",
    authenticate: true,
  },
  {
    method: "delete",
    route: "/zoom-user/:id",
    controller: ZoomController,
    action: "deleteTeachersLicense",
    authenticate: true,
  },
  {
    method: "post",
    route: "/zoom-user/:id",
    controller: ZoomController,
    action: "addLicense",
    authenticate: true,
  },
  {
    method: "post",
    route: "/zoom-user/reassign/:from/:to",
    controller: ZoomController,
    action: "reassignLicense",
    authenticate: true,
  },
  {
    method: "get",
    route: "/zoom-user/inactive/licenses",
    controller: ZoomController,
    action: "getInactiveTeachersWithLicense",
    authenticate: true,
  },
  {
    method: "get",
    route: "/collection-agents",
    controller: CollectionAgentController,
    action: "listCollectionAgents",
    authenticate: true,
  },
  {
    method: "post",
    route: "/csv/collection-agents/bulk-assignment",
    controller: CollectionAgentController,
    action: "updateCollectionExpertsCSV",
  },
  {
    method: "get",
    route: "/zoom-meetings",
    controller: ZoomController,
    action: "listZoomMeetings",
    authenticate: true,
  },
  {
    method: "post",
    route: "/zoom-meeting/reassign/:meetingId/:userId",
    controller: ZoomController,
    action: "reassignZoomMeeting",
    authenticate: true,
  },
  {
    method: "post",
    route: "/zoom-user/update/zak",
    controller: ZoomController,
    action: "updateZakToken",
    authenticate: false,
  },
  {
    method: "get",
    route: "/c/s/:batchCode",
    controller: ZoomController,
    action: "redirectStudent",
  },
  {
    method: "get",
    route: "/c/us/:userCode",
    controller: ZoomController,
    action: "redirectUniqueStudent",
  },
  {
    method: "get",
    route: "/c/t/:teacherCode",
    controller: ZoomController,
    action: "redirectTeacher",
  },
  {
    method: "get",
    route: "/zoom/csv/meetings",
    controller: ZoomController,
    action: "getZoomMeetingsCSV",
  },
  {
    method: "post",
    route: "/zoom/links/sync/cosmos",
    controller: ZoomController,
    action: "syncZoomLinksWithCosmos",
  },
  {
    method: "post",
    route: "/zoom/meetings/reset/settings",
    controller: ZoomController,
    action: "resetZoomMeetingsSettings",
  },
  {
    method: "post",
    route: "/student/deactivate/bulk",
    controller: UserController,
    action: "deactivateStudents",
    authenticate: false,
  },
  {
    method: "post",
    route: "/generate/zoom/join/links/bulk",
    controller: ZoomController,
    action: "generateStudentsJoinLink",
    authenticate: false,
  },
  {
    method: "post",
    route: "/generate/user/unique/code/bulk",
    controller: UserController,
    action: "generateUsersCode",
    authenticate: false,
  },
  {
    method: "post",
    route: "/zoom/sync/attendance",
    controller: ZoomController,
    action: "syncAttendance",
    authenticate: false,
  },
  {
    method: "post",
    route: "/student/validate/status",
    controller: UserController,
    action: "validateStudentStatus",
    authenticate: false,
  },
  {
    method: "get",
    route: "/sync-users-to-mongo",
    controller: UserController,
    action: "syncUsersToMongo",
  },
  {
    method: "post",
    route: "/sync/student/payments/info/mongo",
    controller: UserController,
    action: "syncStudentPaymentInfo",
    authenticate: false,
  },
  {
    method: "post",
    route: "/csv/installments/delete-bulk-installments",
    controller: InstallmentController,
    action: "updateDeleteInstallmentsCSV",
  },
  {
    method: "post",
    route: "/csv/installments/add-bulk-installments",
    controller: InstallmentController,
    action: "updateAddInstallmentsCSV",
  },
  {
    method: "post",
    route: "/activateCashfreeSubscription",
    controller: PaymentController,
    action: "activateCashfreeSubscription",
  },
  {
    method: "post",
    route: "/activateAllOnHoldCashfreeSubscription",
    controller: PaymentController,
    action: "activateAllOnHoldCashfreeSubscription",
  },
  {
    method: "all",
    route: "/logs",
    controller: LogsProxyController,
    action: "serve",
    authenticate: true,
  },
  {
    method: "get",
    route: "/batching/startclasslater-to-batching",
    controller: BatchController,
    action: "syncClassStartDate",
  },
  {
    method: "get",
    route: "/listSchool",
    controller: SchoolController,
    action: "listSchools",
  },
  {
    method: "post",
    route: "/createSchool",
    controller: SchoolController,
    action: "addSchool",
  },
  {
    method: "put",
    route: "/editSchool",
    controller: SchoolController,
    action: "editSchool",
  },
  {
    method: "get",
    route: "/getSra",
    controller: SchoolController,
    action: "getSra",
  },
  {
    method: "get",
    route: "/listBatchForSchool",
    controller: SchoolController,
    action: "listBatches",
  },
  {
    method: "post",
    route: "/createSRA",
    controller: SchoolController,
    action: "createSRA",
  },
  {
    method: "put",
    route: "/editSRA",
    controller: SchoolController,
    action: "editSRA",
  },
  {
    method: "post",
    route: "/webhook/updateRazorpayStatus",
    controller: PaymentController,
    action: "updateRazorpayWebhookStatus",
  },
  {
    method: "post",
    route: "/batch/updateDueDate",
    controller: BatchController,
    action: "updateBatchEndDate",
  },
  {
    method: "post",
    route: "/addBatchtoSchool",
    controller: SchoolController,
    action: "addBatchtoSchool",
  },
  {
    method: "put",
    route: "/batch/checkStudent",
    controller: BatchController,
    action: "checkStudentBatches",
  },
  {
    method: "post",
    route: "/listLocations",
    controller: SchoolController,
    action: "getLocation",
  },
  {
    method: "put",
    route: "/bulkRemoveStudentsFromBatch",
    controller: BatchController,
    action: "bulkRemoveStudentsFromBatch",
  },
];

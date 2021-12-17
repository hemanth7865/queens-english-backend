import { LoginController } from "./controller/LoginController";
import { UserController } from "./controller/UserController";
import { BatchController } from "./controller/BatchController";
import { SessionController } from "./controller/SessionController";

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
    method: "post",
    route: "/leads",
    controller: UserController,
    action: "saveLeads",
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
  },
  {
    method: "get",
    route: "/session/batch/:id",
    controller: SessionController,
    action: "getBatchSessions",
  },
  {
    method: "get",
    route: "/session/batch/:id/:lessonId",
    controller: SessionController,
    action: "getBatchLessonSession",
  },
  {
    method: "get",
    route: "/session",
    controller: SessionController,
    action: "getSessions",
  },
  {
    method: "post",
    route: "/session",
    controller: SessionController,
    action: "createSession",
  },
  {
    method: "put",
    route: "/session/:id",
    controller: SessionController,
    action: "updateSession",
  },
];

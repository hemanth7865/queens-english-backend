import { NextFunction, Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import { Session } from "../entity/Session";
import { SessionService } from "../services/SessionService";
const cron = require("node-cron");

export class SessionController {
  private SessionService = new SessionService();

  async createSession(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    var session: Session;
    console.log("Saving Session");
    try {
      session = await this.SessionService.createSession(request.body);
    } catch (error) {
      return { success: false, error: error.toString() };
    }
    return { success: true, session: session };
  }

  async updateSession(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    var session: Session;
    console.log("Updating Session");
    try {
      session = await this.SessionService.updateSession(request.params.id, request.body);
    } catch (error) {
      return { success: false, error: error.toString() };
    }
    return { success: true, session: session };
  }

  async getBatchSessions(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    var session: Session[] = null;
    try {
      session = await this.SessionService.getBatchSessions(request.params.id);
      if (session == null || session.length == 0) {
        return { success: false, message: "Session doesn't exist" };
      }
    } catch (error) {
      console.log("Error in getting the sessions:" + error);
      return { success: false, message: "Unknown Error fetching session details" };
    }
    return { success: true, session: session };
  }

  async getBatchLessonSession(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    var session: Session = null;
    try {
      var { id, lessonId } = request.params;
      session = await this.SessionService.getBatchLessonSession(id, lessonId);
      if (session == null) {
        return { success: false, message: "Session doesn't exist" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Unknown Error fetching session details" };
    }
    return { success: true, session: session };
  }


  async getSessions(request: Request, response: Response, next: NextFunction) {
    var res: Session[];
    try {
      res = await this.SessionService.getSessions();
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async getSessionDetail(request: Request, response: Response, next: NextFunction) {
    var res: Session;
    try {
      res = await this.SessionService.getSessionDetail(request.params.id);
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}

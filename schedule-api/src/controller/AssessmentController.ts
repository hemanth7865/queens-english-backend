import { NextFunction, Request, Response } from "express";
import { Assessment } from "../entity/Assessment";
import { StudentAssessment } from "../entity/StudentAssessment";
import { AssessmentService } from "../services/AssessmentService";
const cron = require("node-cron");

export class AssessmentController {
  private assessmentService = new AssessmentService();

  async getBatchAssessments(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    var assessment: StudentAssessment[] = null;
    try {
      assessment = await this.assessmentService.getBatchAssessments(
        request.params.id,
        request
      );
      if (assessment == null || assessment.length == 0) {
        return { success: false, message: "Assessment doesn't exist" };
      }
    } catch (error) {
      console.log("Error in getting the Assessments:" + error);
      return {
        success: false,
        message: "Unknown Error fetching Assessment details",
      };
    }
    return { success: true, Assessment: assessment };
  }

  async getAssessments(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    var res: StudentAssessment[];
    try {
      res = await this.assessmentService.getAssessments(request);
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async updateAssessment(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    var session: StudentAssessment;
    console.log("Updating Assessment");
    try {
      await this.assessmentService.updateAssessment(
        request.params.id,
        request.body
      );
    } catch (error) {
      return { success: false, error: error.toString() };
    }
    return { success: true, "message" : "Successfully Updated Assessment" };
  }

  async getAssessmentDetail(request: Request, response: Response, next: NextFunction) {
    var res: StudentAssessment;
    try {
      res = await this.assessmentService.getAssessmentDetail(request.params.id);
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}

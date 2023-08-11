import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Admin } from "../entity/Admin";
import { AWSService } from "../services/AWSService";
import { CSVUploadService } from "../services/CSVUploadService";

export class CSVUploadController {
  private csvUploadService = new CSVUploadService();
  private adminRepository = getRepository(Admin);

  async saveCSVUploadRecord(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const data = request.body;
    try {
      if (!request?.user?.email)
        throw new Error("User email not found in request.");
      const userData = await this.adminRepository.findOne({
        where: { email: request.user.email },
      });
      if (!userData) throw new Error("User not found.");
      const userId = userData.id;
      return this.csvUploadService.createCsvUploadRecord(
        data,
        userId.toString()
      );
    } catch (e) {
      return {
        message:
          e.message || "Something went wrong while saving CSV upload details.",
        success: false,
      };
    }
  }

  async getCSVUploads(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    var parameters = {
      current: request.query["current"],
      pageSize: request.query["pageSize"],
      date: request.query["date"],
      schoolName: request.query["schoolName"],
      uploadedBy: request.query["uploadedBy"],
      uploadType: request.query["uploadType"],
    };
    try {
      return this.csvUploadService.getCSVUploads(parameters);
    } catch (e) {
      return {
        message:
          e.message || "Something went wrong while saving CSV upload details.",
        success: false,
      };
    }
  }
}

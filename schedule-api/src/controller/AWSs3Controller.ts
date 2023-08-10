import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Admin } from "../entity/Admin";
import { AWSService } from "../services/AWSService";
import { CSVUploadService } from "../services/CSVUploadService";

export class AWSs3Controller {
  private awsService = new AWSService();
  private csvUploadService = new CSVUploadService();
  private adminRepository = getRepository(Admin);

  async uploadFile(request: Request, response: Response, next: NextFunction) {
    const requestQuery = request.query;
    const createRecord = requestQuery.createRecord === "true";

    try {
      if (!request?.user?.email)
        throw new Error("User email not found in request.");
      const userData = await this.adminRepository.findOne({
        where: { email: request.user.email },
      });
      if (!userData) throw new Error("User not found.");
      const userId = userData.id;

      const file = request?.files?.csv;

      if (file) {
        const fileName = await this.awsService.uploadFile(file);
        if (fileName) {
          if (!createRecord) {
            return {
              message: "File uploaded successfully.",
              fileName: fileName,
            };
          }
          return this.csvUploadService.createCsvUploadRecord(
            {
              schoolId: request?.body?.schoolId,
              fileName: fileName,
              uploadType: request?.body?.uploadType,
            },
            userId.toString()
          );
        }
      }
      throw new Error("File not found.");
    } catch (e) {
      return {
        message: e.message || "Something went wrong while uploading file.",
        success: false,
      };
    }
  }
}

import { NextFunction, Request, Response } from "express";
import { ZoomUserService } from "../services/ZoomUsersService";

export class ZoomUserController {
  private zoomUserService = new ZoomUserService();

  /**
   * Get Teachers List That Doesn't Have License (Zoom User Yet)
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async getTeachersWithoutLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return { data: await this.zoomUserService.getTeachersWithoutLicense() };
  }

  /**
   * Generate Account On Zoom For Each Teacher
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async generateTeachersLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return { data: await this.zoomUserService.generateTeachersLicense() };
  }
}

import { NextFunction, Request, Response } from "express";
import { ZoomUserService } from "../services/ZoomUsersService";
import { ZoomMeetingService } from "../services/ZoomMeetingService";

export class ZoomController {
  private zoomUserService = new ZoomUserService();
  private zoomMeetingService = new ZoomMeetingService();

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

  /**
   * Get Batch That Doesn't Have Zoom Link
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async getBatchesWithoutZoomLink(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    return await this.zoomMeetingService.getBatchesWithoutZoomLink();
  }

  /**
   * Get Active Batches That Has No Batch
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async getActiveBatchesWithoutZoomLink(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    return await this.zoomMeetingService.getActiveBatchesWithoutZoomLink();
  }
}

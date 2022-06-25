import { NextFunction, Request, Response } from "express";
import { ZoomUserService } from "../services/ZoomUsersService";
import { ZoomMeetingService } from "../services/ZoomMeetingService";

export class ZoomController {
  private zoomUserService = new ZoomUserService();
  private zoomMeetingService = new ZoomMeetingService();

  /**
   * Get Teachers List That Don't Have License (Zoom User Yet)
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
   * Get Active Teachers List That Don't Have License (Zoom User Yet)
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async getActiveTeachersWithoutLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return {
      data: await this.zoomUserService.getActiveTeachersWithoutLicense(),
    };
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
   * Delete Account On Zoom For Each Teacher
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async deleteTeachersLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return {
      data: await this.zoomUserService.deleteTeachersLicense(request.params.id),
    };
  }

  /**
   * Delete Account On Zoom For Each Teacher
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async deleteAllTeachersLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return {
      data: await this.zoomUserService.deleteAllTeachersLicense(),
    };
  }

  /**
   * Generate Account On Zoom For Each Active Teacher
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async generateActiveTeachersLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return { data: await this.zoomUserService.generateActiveTeachersLicense() };
  }

  /**
   * Get Batch That Don't Have Zoom Link
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

  /**
   * Get Active Batches That Has No Batch
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async generateActiveBatchesZoomLink(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    return await this.zoomMeetingService.generateActiveBatchesZoomLink();
  }

  /**
   * Get Active Batches That Has No Batch
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async listZoomUsers(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return await this.zoomUserService.listZoomUsers(request.query);
  }

  /**
   * Get Active Batches That Has No Batch
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async showZoomUser(request: Request, response: Response, next: NextFunction) {
    this.zoomUserService.request = request;
    return await this.zoomUserService.showZoomUser(request.params.id);
  }

  /**
   * Get Active Batches That Has No Batch
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async addLicense(request: Request, response: Response, next: NextFunction) {
    this.zoomUserService.request = request;
    return await this.zoomUserService.addLicense(request.params.id);
  }
}

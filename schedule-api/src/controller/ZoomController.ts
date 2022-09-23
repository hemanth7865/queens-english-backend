import { NextFunction, Request, Response } from "express";
import { ZoomUserService } from "../services/ZoomUsersService";
import { ZoomMeetingService } from "../services/ZoomMeetingService";
import { UserZoomLinkService } from "../services/UserZoomLinkService";

export class ZoomController {
  private zoomUserService = new ZoomUserService();
  private zoomMeetingService = new ZoomMeetingService();
  private userZoomLinkService = new UserZoomLinkService();

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
  async listZoomMeetings(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return await this.zoomMeetingService.listZoomMeetings(request.query);
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

  /**
   * Get Active Batches That Has No Batch
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async reassignLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return await this.zoomUserService.reassignLicense(
      request.params.from,
      request.params.to
    );
  }

  /**
   * Get Active Batches That Has No Batch
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async reassignZoomMeeting(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    return await this.zoomMeetingService.reassignZoomMeeting(
      request.params.meetingId,
      request.params.userId
    );
  }

  /**
   * Update zak token for one user or all licenses
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async updateZakToken(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return await this.zoomUserService.updateZakToken(request.query.userId);
  }

  /**
   * Update zak token for one user or all licenses
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async getZoomMeetingsCSV(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    const data = await this.zoomMeetingService.getZoomMeetingsCSV();
    response.attachment("zoom-backup.csv");
    response.status(200).send(data);
    return;
  }

  /**
   * Get Inactive Teachers With Licenses
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async getInactiveTeachersWithLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomUserService.request = request;
    return await this.zoomUserService.getInactiveTeachersWithLicense();
  }

  /**
   * Get Inactive Teachers With Licenses
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async syncZoomLinksWithCosmos(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    return await this.zoomMeetingService.syncZoomLinksWithCosmos();
  }

  /**
   * Reset/Update Zoom Meetings Settings In Bulk
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async resetZoomMeetingsSettings(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    return await this.zoomMeetingService.resetZoomMeetingsSettings();
  }

  /**
   * Redirect To Zoom Meeting Based On Selected Batch Code For Student.
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async redirectStudent(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    const result = await this.zoomMeetingService.redirectStudent(
      request.params.batchCode
    );

    if (result.error) {
      response.status(404).send("Not found");
      return;
    }

    if (result.link) {
      return response.redirect(result.link);
    }

    return result;
  }

  /**
   * Redirect To Zoom Meeting Based On Selected Batch Code For Student.
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async redirectUniqueStudent(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.userZoomLinkService.request = request;
    const result = await this.userZoomLinkService.redirectUniqueStudent(
      request.params.userCode
    );

    if (result.error) {
      response.status(404).send("Not found");
      return;
    }

    if (result.link) {
      return response.redirect(result.link);
    }

    return result;
  }

  /**
   * Redirect To Zoom Meeting Based On Selected Batch Code For Teacher.
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async redirectTeacher(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.zoomMeetingService.request = request;
    const result = await this.zoomMeetingService.redirectTeacher(
      request.params.teacherCode
    );

    if (result.error) {
      response.status(404).send("Not found");
      return;
    }

    if (result.link) {
      return response.redirect(result.link);
    }

    return result;
  }

  /**
   * Generate Students Join Link
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async generateStudentsJoinLink(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.userZoomLinkService.request = request;
    return await this.userZoomLinkService.generateStudentsJoinLink();
  }
}

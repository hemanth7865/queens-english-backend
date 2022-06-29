import { NextFunction, Request, Response } from "express";
import { isNullOrUndefined } from "util";
import { CollectionAgentService } from "../services/CollectionAgentService";
const { usersLogger } = require("../Logger.js");

export class CollectionAgentController {
  private collectionAgentService = new CollectionAgentService();

  /**
   * Get Active Batches That Has No Batch
   * @param request
   * @param response
   * @param next
   * @returns
   */
  async listCollectionAgents(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.collectionAgentService.request = request;
    return await this.collectionAgentService.listCollectionAgents(
      request.query
    );
  }
}

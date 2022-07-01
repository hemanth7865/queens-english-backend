import { NextFunction, Request, Response } from "express";
import { isNullOrUndefined } from "util";
import { CollectionAgentService } from "../services/CollectionAgentService";
const { usersLogger } = require("../Logger.js");
import { parse } from "csv-parse";

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

  async updateCollectionExpertsCSV(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const file = request.files.agents;
    let data = [];

    try {
      await new Promise(function (myResolve: any, myReject: any) {
        parse(
          file.data.toString(),
          { columns: true, trim: true },
          function (e, records) {
            data = records;
            if (data) {
              myResolve();
            } else {
              console.log(file.data.toString());
              myReject();
            }
          }
        );
      });
      return this.collectionAgentService.updateCollectionExpertsCSV(
        data,
        request.query
      );
    } catch (e) {
      return { e, name: file.name, size: file.size, type: file.type };
    }
  }
}

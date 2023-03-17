import { NextFunction, Request, Response } from "express";
import axios from "../helpers/axios";

export class AzureProxyController {
  async serve(request: Request, response: Response, next: NextFunction) {
    const url = request.query.url;
    request.query.url = undefined;
    try {
      return await axios({
        method: request.method,
        url,
        params: request.query,
        data: request.body,
      })
        .then(async (res) => {
          return res.data;
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    } catch (e) {
      console.log(e);
      return { error: true, msg: e.message };
    }
  }
}

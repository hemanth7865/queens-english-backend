import { NextFunction, Request, Response } from "express";
import axios from "../helpers/axios";
import defaultAxios from "axios";

export class AzureProxyController {
  async serve(request: Request, response: Response, next: NextFunction) {
    const url = request.query.url as string;
    request.query.url = undefined;
    const { data, error, msg } = await AzureProxyController.request(url, {
      method: request.method as any,
      query: request.query,
      body: request.body,
    });

    if (!error) {
      return Promise.resolve(data);
    }

    return Promise.reject({ error: true, message: msg });
  }

  async fileProxy(request: Request, response: Response, next: NextFunction) {
    let url = request.query.url as string;
    url = url?.split("?")[0]
    url = `${url}?sp=racwd&st=2025-04-01T17:58:34Z&se=2026-04-01T01:58:34Z&sv=2024-11-04&sr=c&sig=QTJETyNsHVcXgDde13dEXMPwG5YM6KQpwKZl%2Fi%2Bb9HY%3D`
    // request.query.url = undefined;
    request.query = {}
    try {
      return await defaultAxios({
        method: request.method as any,
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

  /**
   * A static method that sends an HTTP request to the specified URL with the provided options.
   *
   * @param url - The URL to send the request to.
   * @param options - An object containing the request options.
   * @param options.method - The HTTP method to use for the request. Default is 'get'.
   * @param options.query - An object containing the query parameters to be sent with the request.
   * @param options.body - The request body to be sent with the request.
   *
   * @returns A Promise that resolves to an object containing the response data.
   * If an error occurs during the request, the Promise will reject with an object containing an error flag and an error message.
   */
  static async request<T = any>(
    url: string,
    options: {
      method?: "get" | "post" | "put" | "delete";
      query?: any;
      body?: any;
    }
  ): Promise<{ error?: Boolean; msg?: string; data?: T }> {
    const { method, query, body } = options;

    try {
      const res = await axios({
        method: method || "get",
        url,
        params: query,
        data: body,
      });
      return { data: res.data };
    } catch (e) {
      let message = "";
      console.log(e);
      if (defaultAxios.isAxiosError(e)) {
        message =
          typeof e.response.data !== "object"
            ? `${e.response.data}`
            : JSON.stringify(e.response.data);
      }
      if (!message) {
        message = e.message || "Error while sending request to Azure APIs";
      }
      return { error: true, msg: message };
    }
  }
}

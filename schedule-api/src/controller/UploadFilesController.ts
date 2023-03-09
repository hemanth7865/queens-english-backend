import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getBlobClient } from "./../helpers/BlobClient";

export class UploadFilesController {
  async uploadImages(request: Request, response: Response, next: NextFunction) {
    try {
      const images = [];

      const query = request.query;
      const containerPath = `assets/images-uploads${
        query.path ? "/" + query.path : ""
      }`;

      if (!Array.isArray(request.files.images)) {
        request.files.images = [request.files.images];
      }
      for (let image of request.files.images) {
        const fileName = uuid() + image.name;
        const blobContainerClient = await getBlobClient(containerPath);
        const blockBlobClient =
          blobContainerClient.getBlockBlobClient(fileName);

        await blockBlobClient.upload(image.data, image.data.byteLength);

        images.push(containerPath + "/" + fileName);
      }

      return {
        images,
      };
    } catch (e) {
      console.log(e);
      return { error: true, msg: e.message };
    }
  }
}

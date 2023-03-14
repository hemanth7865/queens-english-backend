import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getBlobClient } from "./../helpers/BlobClient";

export class UploadFilesController {
    async uploadImages(request: Request, response: Response, next: NextFunction) {
        try {
            const images = [];

            const query = request.query;
            const path = "images-uploads"
            const containerPath = `assets/${query.fileLocation ? query.fileLocation : path}${query.path ? "/" + query.path : ""}`;
            console.log("containerPath", containerPath)

            if (request.files) {
                if (!Array.isArray(request.files.images)) {
                    request.files.images = [request.files.images];
                }
                for (let image of request.files.images) {
                    const fileName = uuid() + image.name
                    const size = image.data.byteLength;
                    const blobContainerClient = await getBlobClient(containerPath);
                    const blockBlobClient = blobContainerClient.getBlockBlobClient(fileName);
                    await blockBlobClient.upload(image.data, size);

                    images.push(containerPath + "/" + fileName);
                }
                return {
                    images,
                };
            } else {
                if (!Array.isArray(request.body)) {
                    request.body = [request.body];
                }
                console.log("request.body", request.body)
                for (let image of request.body) {
                    const fileName = image.name
                    const size = image.size;
                    const blobContainerClient = await getBlobClient(containerPath);
                    const blockBlobClient = blobContainerClient.getBlockBlobClient(fileName);
                    const upload = await blockBlobClient.upload(image.data, size);
                    console.log("upload", upload, "blockBlobClient", blockBlobClient)
                    images.push(containerPath + "/" + fileName);
                }
                return {
                    images,
                };
            }

        } catch (e) {
            console.log(e);
            return { error: true, msg: e.message };
        }
    }
}

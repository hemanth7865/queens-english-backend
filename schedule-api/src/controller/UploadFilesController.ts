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

            if (request.files) {
                if (!Array.isArray(request.files.images)) {
                    request.files.images = [request.files.images];
                }
                for (let image of request.files.images) {
                    const fileName = query.type === "assessment-question-image" ? query.name : uuid() + '__' + image.name
                    const size = image.data.byteLength;
                    const blobContainerClient = await getBlobClient(containerPath);
                    const blockBlobClient = blobContainerClient.getBlockBlobClient(fileName);
                    await blockBlobClient.upload(image.data, size);
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

    async uploadPDF(request: Request, response: Response, next: NextFunction) {
        try {
            const { pdfType, path: extraPath, name } = request.query;
    
            if (!pdfType || typeof pdfType !== "string") {
                return response.status(400).json({ error: true, msg: "Missing or invalid 'pdfType' parameter." });
            }
    
            const file = request.files?.pdf;
    
            if (!file) {
                return response.status(400).json({ error: true, msg: "No PDF file provided." });
            }
    
            if (Array.isArray(file)) {
                return response.status(400).json({ error: true, msg: "Only one PDF file allowed at a time." });
            }
    
            if (file.mimetype !== "application/pdf") {
                return response.status(400).json({ error: true, msg: "Invalid file type. Only PDFs are allowed." });
            }
    
            // Define storage path based on pdfType
            const basePathMap: Record<string, string> = {
                FreeSpeaking: "free-speaking-pdfs",
            };
    
            const basePath = basePathMap[pdfType];
    
            if (!basePath) {
                return response.status(400).json({ error: true, msg: `Unsupported pdfType: ${pdfType}` });
            }
    
            const containerPath = `assets/${basePath}${extraPath ? "/" + extraPath : ""}`;
    
            // Use provided name or fallback
            const fileName = typeof name === "string" && name.trim() !== ""
                ? name
                : uuid() + '__' + file.name;
    
            const size = file.data.byteLength;
    
            const blobContainerClient = await getBlobClient(containerPath);
            const blockBlobClient = blobContainerClient.getBlockBlobClient(fileName);
            await blockBlobClient.upload(file.data, size);
    
            return response.status(200).json({
                success: true,
                fileUrl: `${containerPath}/${fileName}`,
            });
    
        } catch (e) {
            console.error("Upload PDF Error:", e);
            return response.status(500).json({ error: true, msg: e.message });
        }
    }

    async checkPDFExists(request: Request, response: Response, next: NextFunction) {
        try {
            const { pdfType, name, path: extraPath } = request.query;
    
            if (!pdfType || typeof pdfType !== "string") {
                return response.status(400).json({ error: true, msg: "Missing or invalid 'pdfType' parameter." });
            }
    
            if (!name || typeof name !== "string") {
                return response.status(400).json({ error: true, msg: "Missing or invalid 'name' parameter." });
            }
    
            // Define storage path based on pdfType
            const basePathMap: Record<string, string> = {
                FreeSpeaking: "free-speaking-pdfs",
            };
    
            const basePath = basePathMap[pdfType];
    
            if (!basePath) {
                return response.status(400).json({ error: true, msg: `Unsupported pdfType: ${pdfType}` });
            }
    
            const containerPath = `assets/${basePath}${extraPath ? "/" + extraPath : ""}`;
            const blobContainerClient = await getBlobClient(containerPath);
            const blockBlobClient = blobContainerClient.getBlockBlobClient(name);
    
            const exists = await blockBlobClient.exists(); // ✅ Azure SDK built-in method
    
            return response.status(200).json({ exists });
    
        } catch (e) {
            console.error("Check PDF Exists Error:", e);
            return response.status(500).json({ error: true, msg: e.message });
        }
    }
}

import { Request, Response, NextFunction } from "express";
import { S3Service } from "../services/s3.service";
import { ApiResponse, ApiError } from "../utils/ApiResponse";

export class FileUploadController {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  // Get presigned URL for direct upload to S3
  async getPresignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, fileType, folder = "uploads" } = req.body;

      if (!fileName || !fileType) {
        throw new ApiError(400, "FileName and fileType are required", null, 'fileNameRequired');
      }

      // Validate file type
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|webp|svg/;
      const extname = allowedTypes.test(fileName.toLowerCase());
      const mimetype = allowedTypes.test(fileType.toLowerCase());

      if (!mimetype || !extname) {
        throw new ApiError(400, "Invalid file type. Only images and documents are allowed.", null, 'fileTypeInvalid');
      }

      // Validate file size (this is a basic check, actual validation happens on S3)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.body.fileSize && req.body.fileSize > maxSize) {
        throw new ApiError(400, "File size exceeds 10MB limit", null, 'fileSizeExceeded');
      }

      const uploadUrl = await this.s3Service.getPresignedUrl(fileName, fileType, folder);

      res.json(ApiResponse.success(uploadUrl).build());
    } catch (error) {
      next(error);
    }
  }

  // Get presigned URL for multiple files
  async getMultiplePresignedUrls(req: Request, res: Response, next: NextFunction) {
    try {
      const { files, folder = "uploads" } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        throw new ApiError(400, "Files array is required", null, 'filesArrayRequired');
      }

      if (files.length > 5) {
        throw new ApiError(400, "Maximum 5 files allowed per request", null, 'maxFilesExceeded');
      }

      const uploadUrls = [];

      for (const file of files) {
        const { fileName, fileType, fileSize } = file;

        if (!fileName || !fileType) {
          throw new ApiError(400, "FileName and fileType are required for each file", null, 'fileNameRequired');
        }

        // Validate file type
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|webp|svg/;
        const extname = allowedTypes.test(fileName.toLowerCase());
        const mimetype = allowedTypes.test(fileType.toLowerCase());

        if (!mimetype || !extname) {
          throw new ApiError(400, `Invalid file type for ${fileName}. Only images and documents are allowed.`, null, 'fileTypeInvalid');
        }

        // Validate file size
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (fileSize && fileSize > maxSize) {
          throw new ApiError(400, `File size for ${fileName} exceeds 10MB limit`, null, 'fileSizeExceeded');
        }

        const uploadUrl = await this.s3Service.getPresignedUrl(fileName, fileType, folder);
        uploadUrls.push({
          fileName,
          fileType,
          fileSize,
          ...uploadUrl,
        });
      }

      res.json(ApiResponse.success({ uploadUrls }).build());
    } catch (error) {
      next(error);
    }
  }

  // Delete file from S3
  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileKey } = req.body;

      if (!fileKey) {
        throw new ApiError(400, "File key is required", null, 'fileKeyRequired');
      }

      await this.s3Service.deleteFile(fileKey);

      res.json(
        ApiResponse.success({ message: "File deleted successfully" }).build()
      );
    } catch (error) {
      next(error);
    }
  }

  // Get file info (public URL)
  async getFileInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileKey } = req.params;

      if (!fileKey) {
        throw new ApiError(400, "File key is required", null, 'fileKeyRequired');
      }

      const publicUrl = this.s3Service.getPublicUrl(fileKey);

      res.json(
        ApiResponse.success({
          fileKey,
          publicUrl,
        }).build()
      );
    } catch (error) {
      next(error);
    }
  }
}
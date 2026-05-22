import { Request, Response, NextFunction } from "express";
import { StorageService } from "../services/storage.service";
import { ApiResponse, ApiError } from "../utils/ApiResponse";
import { MAX_FILE_SIZE, MAX_FILES_PER_REQUEST } from "../constants/common";

export class FileUploadController {
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
  }

  // Get presigned URL for direct upload to object storage
  async getPresignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, fileType } = req.body;

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

      // Validate file size here before direct upload storage validation.
      if (req.body.fileSize && req.body.fileSize > MAX_FILE_SIZE) {
        throw new ApiError(400, "File size exceeds 10MB limit", null, 'fileSizeExceeded');
      }

      const uploadUrl = await this.storageService.getPresignedUrl(fileName, fileType);

      res.json(ApiResponse.success(uploadUrl).build());
    } catch (error) {
      next(error);
    }
  }

  // Get presigned URL for multiple files
  async getMultiplePresignedUrls(req: Request, res: Response, next: NextFunction) {
    try {
      const { files } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        throw new ApiError(400, "Files array is required", null, 'filesArrayRequired');
      }

      if (files.length > MAX_FILES_PER_REQUEST) {
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
        if (fileSize && fileSize > MAX_FILE_SIZE) {
          throw new ApiError(400, `File size for ${fileName} exceeds 10MB limit`, null, 'fileSizeExceeded');
        }

        const uploadUrl = await this.storageService.getPresignedUrl(fileName, fileType);
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

  // Delete file from object storage
  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileKey } = req.body;

      if (!fileKey) {
        throw new ApiError(400, "File key is required", null, 'fileKeyRequired');
      }

      await this.storageService.deleteFile(fileKey);

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

      const publicUrl = this.storageService.getPublicUrl(fileKey);

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

  // Move file from upload folder to permanent folder
  async moveToPermanent(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileKey, folder = "products" } = req.body;

      if (!fileKey) {
        throw new ApiError(400, "File key is required", null, 'fileKeyRequired');
      }

      const result = await this.storageService.moveToPermanent(fileKey, folder);

      res.json(
        ApiResponse.success(result).build()
      );
    } catch (error) {
      next(error);
    }
  }

  // Move multiple files from upload folder to permanent folder
  async moveMultipleToPermanent(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileKeys, folder = "products" } = req.body;

      if (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0) {
        throw new ApiError(400, "File keys array is required", null, 'fileKeysRequired');
      }

      if (fileKeys.length > 10) {
        throw new ApiError(400, "Maximum 10 files allowed per request", null, 'maxFilesExceeded');
      }

      const results = await this.storageService.moveMultipleToPermanent(fileKeys, folder);

      res.json(
        ApiResponse.success({ results }).build()
      );
    } catch (error) {
      next(error);
    }
  }
}

import express from "express";
import { FileUploadController } from "../controllers/fileUpload.controller";

const router = express.Router();
const fileUploadController = new FileUploadController();

// Get presigned URL for direct S3 upload
router.post("/upload-url", fileUploadController.getPresignedUrl.bind(fileUploadController));

// Get presigned URLs for multiple files
router.post("/upload-urls", fileUploadController.getMultiplePresignedUrls.bind(fileUploadController));

// Delete file from S3
router.delete("/delete", fileUploadController.deleteFile.bind(fileUploadController));

// Get file info (public URL)
router.get("/info/:fileKey", fileUploadController.getFileInfo.bind(fileUploadController));

export default router;

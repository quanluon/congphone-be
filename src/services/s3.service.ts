import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import { EnvVariables } from "../config/env";

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private defaultFolder = "uploads";

  constructor() {
    this.s3Client = new S3Client({
      region: EnvVariables.AWS_REGION!,
      credentials: {
        accessKeyId: EnvVariables.AWS_ACCESS_KEY_ID!,
        secretAccessKey: EnvVariables.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = EnvVariables.S3_BUCKET!;
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(originalName);
    const sanitizedName = path
      .basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
  }

  async getPresignedUrl(fileName: string, fileType: string) {
    const uniqueFileName = this.generateUniqueFileName(fileName);
    const key = `${this.defaultFolder}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      url,
      key,
      publicUrl: this.getPublicUrl(key),
    };
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: this.getSourceKey(key),
    });

    await this.s3Client.send(command);
  }

  getBaseUrl(): string {
    return `https://${this.bucket}.s3.${EnvVariables.AWS_REGION}.amazonaws.com/`;
  }

  // getPublicUrl(key: string): string {
  //   return `https://${this.bucket}.s3.${EnvVariables.AWS_REGION}.amazonaws.com/${key}`;
  // }

  getPublicUrl(key: string): string {
    return `${EnvVariables.CLOUDFRONT_STORAGE_ENDPOINT}/${key}`;
  }

  getSourceKey(sourceUrl: string): string {
    if (!sourceUrl) return "";
    return sourceUrl.replace(this.getBaseUrl(), "");
  }

  // Move file from upload folder to permanent folder
  async moveToPermanent(sourceUrl: string, folder: string) {
    const sourceKey = this.getSourceKey(sourceUrl);
    if (!sourceKey?.startsWith(this.defaultFolder))
      return {
        key: sourceKey,
        publicUrl: sourceUrl,
      };
    const uniqueFileName = this.generateUniqueFileName(sourceKey);
    const destinationKey = `${folder}/${uniqueFileName}`;

    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: destinationKey,
      CopySource: `${this.bucket}/${sourceKey}`,
      ACL: "public-read",
    });

    await this.s3Client.send(command);

    // Delete the original file from upload folder
    await this.deleteFile(sourceKey);

    return {
      key: destinationKey,
      publicUrl: this.getPublicUrl(destinationKey),
    };
  }

  // Move multiple files from upload folder to permanent folder
  async moveMultipleToPermanent(
    sourceKeys: string[],
    folder: string = "products"
  ) {
    const results = await Promise.all(
      sourceKeys.map((key) => this.moveToPermanent(key, folder))
    );

    return results;
  }
}

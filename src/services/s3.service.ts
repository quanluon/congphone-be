import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import { EnvVariables } from "@/config/env";

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: EnvVariables.AWS_REGION,
    });
    this.bucket = EnvVariables.S3_BUCKET;
  }

  private generateUniqueFileName(originalName: string): string {
    console.log("originalName", originalName);

    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(originalName);
    const sanitizedName = path
      .basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
  }

  async getPresignedUrl(
    fileName: string,
    fileType: string,
    folder: string = "uploads"
  ) {
    const uniqueFileName = this.generateUniqueFileName(fileName);
    const key = `${folder}/${uniqueFileName}`;

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
      Key: key,
    });

    await this.s3Client.send(command);
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${EnvVariables.AWS_REGION}.amazonaws.com/${key}`;
  }

  async storePermanent(sourceKey: string, destinationKey: string, folder: string) {
    const uniqueFileName = this.generateUniqueFileName(destinationKey);
    const key = `${folder}/${uniqueFileName}`;

    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: key,
      CopySource: `${this.bucket}/${sourceKey}`,
      ACL: "public-read",
    });

    await this.s3Client.send(command);
  }
}

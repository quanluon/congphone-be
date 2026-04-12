import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import { EnvVariables } from "../config/env";
import logger from "../utils/logger";

export interface PreparedImageSource {
  sourceUrl: string;
  originalName: string;
  originalContentType: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number;
  qualityScore: number;
  isLowQuality: boolean;
  buffer: Buffer;
}

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private defaultFolder = "uploads";
  private normalizedCanvasSize = 1200;
  private lowQualityImagePattern =
    /(thumb|thumbnail|small|swatch|icon|sprite|tiny|preview|placeholder|blur|low[\-_]?res|low[\-_]?quality)/i;
  private highQualityImagePattern =
    /(original|master|zoom|large|hi[\-_]?res|high[\-_]?res|retina|full[\-_]?size|gallery)/i;

  constructor() {
    this.s3Client = new S3Client({
      region: EnvVariables.AWS_REGION || "ap-southeast-1",
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

  private getOriginalFileName(sourceUrl: string): string {
    try {
      const urlPath = new URL(sourceUrl).pathname;
      return path.basename(urlPath) || "image";
    } catch {
      return "image";
    }
  }

  private async getNormalizedImageConfig(input: {
    originalName: string;
    originalContentType: string;
    buffer: Buffer;
  }) {
    const image = sharp(input.buffer, { failOn: "none" }).rotate();

    return image.metadata().then(async (metadata) => {
      const usePng =
        metadata.hasAlpha ||
        input.originalContentType.includes("png") ||
        input.originalContentType.includes("svg");

      const fittedImage = image
        .resize(this.normalizedCanvasSize, this.normalizedCanvasSize, {
          fit: "contain",
          background: usePng
            ? { r: 255, g: 255, b: 255, alpha: 0 }
            : { r: 255, g: 255, b: 255, alpha: 1 },
          withoutEnlargement: true,
        })
        .sharpen({ sigma: 1.1, m1: 0.8, m2: 2.2, x1: 2, y2: 10, y3: 20 });

      const normalizedBuffer = usePng
        ? await fittedImage.png({ compressionLevel: 9 }).toBuffer()
        : await fittedImage.jpeg({ quality: 92, mozjpeg: true }).toBuffer();

      return {
        normalizedBuffer,
        contentType: usePng ? "image/png" : "image/jpeg",
        fileName: `${path.basename(input.originalName, path.extname(input.originalName) || "") || "image"}${usePng ? ".png" : ".jpg"}`,
      };
    });
  }

  private calculateImageQualityScore(candidate: {
    sourceUrl: string;
    width: number | null;
    height: number | null;
    bytes: number;
    format: string | null;
  }): number {
    let score = 0;
    const { sourceUrl, width, height, bytes, format } = candidate;

    if (width && height) {
      score += Math.min(width, 2400) / 20;
      score += Math.min(height, 2400) / 20;
      score += Math.min((width * height) / 50000, 120);
    }

    score += Math.min(bytes / 50000, 80);

    if (format && ["jpeg", "jpg", "png", "webp", "avif"].includes(format)) {
      score += 20;
    }

    if (this.highQualityImagePattern.test(sourceUrl)) {
      score += 40;
    }

    if (this.lowQualityImagePattern.test(sourceUrl)) {
      score -= 90;
    }

    if (!width || !height) {
      score -= 50;
    } else {
      if (width < 500 || height < 500) {
        score -= 100;
      }
      if (width < 800 || height < 800) {
        score -= 30;
      }
    }

    if (bytes < 25_000) {
      score -= 60;
    } else if (bytes < 60_000) {
      score -= 20;
    }

    return score;
  }

  private isImageLowQuality(candidate: {
    width: number | null;
    height: number | null;
    bytes: number;
    qualityScore: number;
  }): boolean {
    const { width, height, bytes, qualityScore } = candidate;

    if (!width || !height) return true;
    if (width < 500 || height < 500) return true;
    if (bytes < 25_000) return true;

    return qualityScore < 100;
  }

  async prepareImageSource(sourceUrl: string): Promise<PreparedImageSource | null> {
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      if (!contentType.startsWith("image/")) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const metadata = await sharp(buffer, { failOn: "none" }).metadata();

      const prepared: PreparedImageSource = {
        sourceUrl,
        originalName: this.getOriginalFileName(sourceUrl),
        originalContentType: contentType,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        format: metadata.format ?? null,
        bytes: buffer.byteLength,
        qualityScore: 0,
        isLowQuality: false,
        buffer,
      };

      prepared.qualityScore = this.calculateImageQualityScore(prepared);
      prepared.isLowQuality = this.isImageLowQuality(prepared);

      return prepared;
    } catch (error) {
      logger.warn({ err: error, sourceUrl }, "Failed to prepare image source");
      return null;
    }
  }

  async prepareImageSources(sourceUrls: string[]): Promise<PreparedImageSource[]> {
    const uniqueSourceUrls = [...new Set(sourceUrls.filter(Boolean))];
    const prepared = await Promise.all(
      uniqueSourceUrls.map((sourceUrl) => this.prepareImageSource(sourceUrl)),
    );

    return prepared
      .filter((candidate): candidate is PreparedImageSource => Boolean(candidate))
      .sort((left, right) => right.qualityScore - left.qualityScore);
  }

  async persistPreparedImageSource(
    candidate: PreparedImageSource,
    folder: string = "products",
  ): Promise<string> {
    const { normalizedBuffer, contentType, fileName } =
      await this.getNormalizedImageConfig(candidate);
    const uniqueFileName = this.generateUniqueFileName(fileName);
    const key = `${folder}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: normalizedBuffer,
      ContentType: contentType,
      ACL: "public-read",
    });

    await this.s3Client.send(command);
    return this.getPublicUrl(key);
  }

  async persistPreparedImageSources(
    candidates: PreparedImageSource[],
    folder: string = "products",
  ): Promise<string[]> {
    return Promise.all(
      candidates.map((candidate) => this.persistPreparedImageSource(candidate, folder)),
    );
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

  isManagedUrl(url: string): boolean {
    if (!url) return false;

    const cloudfrontBase = EnvVariables.CLOUDFRONT_STORAGE_ENDPOINT;

    return (
      url.startsWith(this.getBaseUrl()) ||
      url.startsWith(cloudfrontBase!) ||
      url.includes(`/${this.defaultFolder}/`)
    );
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

  async persistImageSource(sourceUrl: string, folder: string): Promise<string> {
    if (!sourceUrl) return sourceUrl;

    if (this.isManagedUrl(sourceUrl)) {
      const { publicUrl } = await this.moveToPermanent(sourceUrl, folder);
      return publicUrl;
    }

    return this.uploadFromUrl(sourceUrl, folder);
  }

  // Upload file from a URL
  async uploadFromUrl(url: string, folder: string = "products"): Promise<string> {
    try {
      const prepared = await this.prepareImageSource(url);
      if (!prepared) {
        throw new Error("Unable to inspect remote image");
      }

      logger.info(
        {
          sourceUrl: url,
          width: prepared.width,
          height: prepared.height,
          bytes: prepared.bytes,
          format: prepared.format,
          qualityScore: prepared.qualityScore,
          isLowQuality: prepared.isLowQuality,
          normalizedCanvasSize: this.normalizedCanvasSize,
        },
        "Prepared remote image for S3 upload",
      );

      return this.persistPreparedImageSource(prepared, folder);
    } catch (error: any) {
      logger.error({ err: error, url }, 'Failed to upload image from URL to S3');
      throw error;
    }
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

  async persistImageSources(
    sourceUrls: string[],
    folder: string = "products",
  ): Promise<string[]> {
    return Promise.all(
      sourceUrls.map((sourceUrl) => this.persistImageSource(sourceUrl, folder)),
    );
  }
}

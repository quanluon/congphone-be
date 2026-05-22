import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mongoose from "mongoose";

import connectToDatabase from "../config/database";
import { EnvVariables } from "../config/env";
import { Category } from "../models/category.model";
import { Product } from "../models/product.model";
import { User } from "../models/user.model";

type MigrationMode = "dry-run" | "execute";

type UrlReference =
  | {
      collection: "products";
      documentId: string;
      path: "images";
      value: string;
    }
  | {
      collection: "products";
      documentId: string;
      path: `variants.${number}.images`;
      value: string;
    }
  | {
      collection: "categories";
      documentId: string;
      path: "image";
      value: string;
    }
  | {
      collection: "users";
      documentId: string;
      path: "profileImage";
      value: string;
    };

type UrlMapping = {
  sourceUrl: string;
  key: string;
  targetUrl: string;
};

const getArgValue = (name: string) => {
  const inlineValue = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inlineValue) {
    return inlineValue.split("=").slice(1).join("=");
  }

  const flagIndex = process.argv.indexOf(name);
  if (flagIndex >= 0) {
    return process.argv[flagIndex + 1];
  }

  return undefined;
};

const getMode = (): MigrationMode => {
  const mode = getArgValue("--mode") || "dry-run";
  if (mode === "dry-run" || mode === "execute") {
    return mode;
  }

  throw new Error("Invalid --mode. Use --mode=dry-run or --mode=execute.");
};

const normalizeEndpoint = (endpoint?: string) => endpoint?.replace(/\/+$/, "");

const getRequiredEnv = (key: keyof typeof EnvVariables) => {
  const value = EnvVariables[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const r2PublicEndpoint = normalizeEndpoint(getRequiredEnv("R2_PUBLIC_ENDPOINT"))!;

const legacyEndpoints = [
  EnvVariables.LEGACY_CLOUDFRONT_STORAGE_ENDPOINT,
  EnvVariables.LEGACY_S3_PUBLIC_ENDPOINT,
  EnvVariables.S3_BUCKET && EnvVariables.AWS_REGION
    ? `https://${EnvVariables.S3_BUCKET}.s3.${EnvVariables.AWS_REGION}.amazonaws.com`
    : undefined,
]
  .map(normalizeEndpoint)
  .filter((endpoint): endpoint is string => Boolean(endpoint));

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${getRequiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
  },
});

const r2Bucket = getRequiredEnv("R2_BUCKET");

const isAlreadyR2Url = (url: string) => url.startsWith(`${r2PublicEndpoint}/`);

const getObjectKey = (url: string) => {
  const matchedEndpoint = legacyEndpoints.find((endpoint) =>
    url.startsWith(`${endpoint}/`),
  );
  if (matchedEndpoint) {
    return url.replace(`${matchedEndpoint}/`, "");
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return null;
    }
  } catch {
    return url.replace(/^\/+/, "") || null;
  }

  return null;
};

const getTargetUrl = (key: string) => `${r2PublicEndpoint}/${key}`;

const collectReferences = async () => {
  const references: UrlReference[] = [];

  const products = await Product.find(
    {},
    {
      images: 1,
      variants: 1,
    },
  ).lean();

  for (const product of products) {
    const documentId = product._id.toString();

    for (const image of product.images || []) {
      references.push({
        collection: "products",
        documentId,
        path: "images",
        value: image,
      });
    }

    product.variants?.forEach((variant, variantIndex) => {
      for (const image of variant.images || []) {
        references.push({
          collection: "products",
          documentId,
          path: `variants.${variantIndex}.images`,
          value: image,
        });
      }
    });
  }

  const categories = await Category.find({}, { image: 1 }).lean();
  for (const category of categories) {
    if (category.image) {
      references.push({
        collection: "categories",
        documentId: category._id.toString(),
        path: "image",
        value: category.image,
      });
    }
  }

  const users = await User.find({}, { profileImage: 1 }).lean();
  for (const user of users) {
    if (user.profileImage) {
      references.push({
        collection: "users",
        documentId: user._id.toString(),
        path: "profileImage",
        value: user.profileImage,
      });
    }
  }

  return references;
};

const buildMappings = (references: UrlReference[]) => {
  const skippedAlreadyR2 = references.filter((reference) =>
    isAlreadyR2Url(reference.value),
  );
  const candidates = references.filter((reference) => !isAlreadyR2Url(reference.value));
  const mappingsByUrl = new Map<string, UrlMapping>();
  const skippedUnmapped: UrlReference[] = [];

  for (const reference of candidates) {
    const key = getObjectKey(reference.value);
    if (!key) {
      skippedUnmapped.push(reference);
      continue;
    }

    mappingsByUrl.set(reference.value, {
      sourceUrl: reference.value,
      key,
      targetUrl: getTargetUrl(key),
    });
  }

  return {
    mappings: [...mappingsByUrl.values()],
    skippedAlreadyR2,
    skippedUnmapped,
  };
};

const copyToR2 = async (mapping: UrlMapping) => {
  const response = await fetch(mapping.sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${mapping.sourceUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const body = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || undefined;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: mapping.key,
      Body: body,
      ContentType: contentType,
    }),
  );
};

const replaceUrl = (value: string, mappingsBySourceUrl: Map<string, UrlMapping>) =>
  mappingsBySourceUrl.get(value)?.targetUrl || value;

const updateDatabaseUrls = async (mappings: UrlMapping[]) => {
  const mappingsBySourceUrl = new Map(
    mappings.map((mapping) => [mapping.sourceUrl, mapping]),
  );

  const products = await Product.find(
    {},
    {
      images: 1,
      variants: 1,
    },
  );
  let productUpdates = 0;

  for (const product of products) {
    let changed = false;
    const productObject = product.toObject();
    const images = (productObject.images || []).map((image) => {
      const nextImage = replaceUrl(image, mappingsBySourceUrl);
      changed ||= nextImage !== image;
      return nextImage;
    });

    const variants = productObject.variants.map((variant) => {
      const nextVariant = { ...variant };
      nextVariant.images = (variant.images || []).map((image) => {
        const nextImage = replaceUrl(image, mappingsBySourceUrl);
        changed ||= nextImage !== image;
        return nextImage;
      });
      return nextVariant;
    });

    if (changed) {
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            images,
            variants,
          },
        },
      );
      productUpdates += 1;
    }
  }

  const categories = await Category.find({}, { image: 1 });
  let categoryUpdates = 0;
  for (const category of categories) {
    if (!category.image) continue;

    const nextImage = replaceUrl(category.image, mappingsBySourceUrl);
    if (nextImage !== category.image) {
      await Category.updateOne({ _id: category._id }, { $set: { image: nextImage } });
      categoryUpdates += 1;
    }
  }

  const users = await User.find({}, { profileImage: 1 });
  let userUpdates = 0;
  for (const user of users) {
    if (!user.profileImage) continue;

    const nextProfileImage = replaceUrl(user.profileImage, mappingsBySourceUrl);
    if (nextProfileImage !== user.profileImage) {
      await User.updateOne(
        { _id: user._id },
        { $set: { profileImage: nextProfileImage } },
      );
      userUpdates += 1;
    }
  }

  return {
    productUpdates,
    categoryUpdates,
    userUpdates,
  };
};

const main = async () => {
  const mode = getMode();
  await connectToDatabase();

  const references = await collectReferences();
  const { mappings, skippedAlreadyR2, skippedUnmapped } = buildMappings(references);

  console.log(
    JSON.stringify(
      {
        mode,
        totalReferences: references.length,
        uniqueObjectsToCopy: mappings.length,
        skippedAlreadyR2: skippedAlreadyR2.length,
        skippedUnmapped: skippedUnmapped.length,
        sampleMappings: mappings.slice(0, 10),
        sampleSkippedUnmapped: skippedUnmapped.slice(0, 10),
      },
      null,
      2,
    ),
  );

  if (mode === "dry-run") {
    return;
  }

  const failedCopies: Array<{ sourceUrl: string; error: string }> = [];
  for (const mapping of mappings) {
    try {
      await copyToR2(mapping);
    } catch (error) {
      failedCopies.push({
        sourceUrl: mapping.sourceUrl,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (failedCopies.length > 0) {
    throw new Error(
      `Copied ${mappings.length - failedCopies.length}/${mappings.length} objects. Failed copies: ${JSON.stringify(
        failedCopies.slice(0, 20),
      )}`,
    );
  }

  const databaseUpdates = await updateDatabaseUrls(mappings);
  console.log(
    JSON.stringify(
      {
        copiedObjects: mappings.length,
        databaseUpdates,
      },
      null,
      2,
    ),
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

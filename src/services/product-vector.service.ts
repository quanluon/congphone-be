import { EnvVariables } from "../config/env";
import { IProduct } from "../models/product.model";
import { ApiError } from "../utils/ApiResponse";
import logger from "../utils/logger";

type ProductVectorContext = {
  brandName?: string | null;
  categoryName?: string | null;
};

type FeatureExtractorOutput = {
  data?: ArrayLike<number>;
  dims?: number[];
};

type FeatureExtractor = (
  texts: string | string[],
  options?: {
    pooling?: "none" | "mean" | "cls" | "first_token" | "eos" | "last_token";
    normalize?: boolean;
  },
) => Promise<FeatureExtractorOutput>;

type TransformersModule = {
  env: {
    allowRemoteModels?: boolean;
    cacheDir?: string;
  };
  pipeline: (
    task: "feature-extraction",
    model: string,
    options?: {
      quantized?: boolean;
    },
  ) => Promise<FeatureExtractor>;
};

const DEFAULT_EMBEDDING_MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const dynamicImport = new Function(
  "modulePath",
  "return import(modulePath);",
) as (modulePath: string) => Promise<TransformersModule>;

const normalizeText = (value?: string | null) =>
  value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim() ?? "";

const appendIfPresent = (parts: string[], label: string, value?: string | null) => {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) {
    return;
  }

  parts.push(`${label}: ${normalizedValue}`);
};

export class ProductVectorService {
  private extractor: FeatureExtractor | null = null;
  private extractorPromise: Promise<FeatureExtractor> | null = null;
  private embeddingModel = EnvVariables.PRODUCT_VECTOR_MODEL || DEFAULT_EMBEDDING_MODEL;
  private quantized = EnvVariables.PRODUCT_VECTOR_QUANTIZED !== "false";

  buildEmbeddingInput(product: Partial<IProduct>, context: ProductVectorContext = {}) {
    const parts: string[] = [];

    appendIfPresent(parts, "Product name", product.name);
    appendIfPresent(parts, "Short description", product.shortDescription);
    appendIfPresent(parts, "Description", product.description);
    appendIfPresent(parts, "Meta title", product.metaTitle);
    appendIfPresent(parts, "Meta description", product.metaDescription);
    appendIfPresent(parts, "Category", context.categoryName);
    appendIfPresent(parts, "Brand", context.brandName);
    appendIfPresent(parts, "Product type", product.productType);

    if (Array.isArray(product.tags) && product.tags.length > 0) {
      appendIfPresent(parts, "Tags", product.tags.join(", "));
    }

    if (Array.isArray(product.features) && product.features.length > 0) {
      appendIfPresent(parts, "Features", product.features.join(" | "));
    }

    if (Array.isArray(product.attributes) && product.attributes.length > 0) {
      const attributeText = product.attributes
        .map((attribute) =>
          [
            attribute.category,
            attribute.name,
            attribute.value,
            attribute.unit,
            attribute.type,
          ]
            .map((item) => normalizeText(item))
            .filter(Boolean)
            .join(": "),
        )
        .filter(Boolean)
        .join(" | ");

      appendIfPresent(parts, "Attributes", attributeText);
    }

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const variantText = product.variants
        .map((variant) => {
          const variantAttributes = Array.isArray(variant.attributes)
            ? variant.attributes
              .map((attribute) =>
                [
                  attribute.category,
                  attribute.name,
                  attribute.value,
                  attribute.unit,
                  attribute.type,
                ]
                  .map((item) => normalizeText(item))
                  .filter(Boolean)
                  .join(": "),
              )
              .filter(Boolean)
              .join(", ")
            : "";

          return [
            variant.name,
            variant.color,
            variant.storage,
            variant.size,
            variant.connectivity,
            variant.simType,
            variantAttributes,
          ]
            .map((item) => normalizeText(item))
            .filter(Boolean)
            .join(" | ");
        })
        .filter(Boolean)
        .join(" || ");

      appendIfPresent(parts, "Variants", variantText);
    }

    return parts.join("\n").slice(0, 12000);
  }

  private async getExtractor() {
    if (this.extractor) {
      return this.extractor;
    }

    if (this.extractorPromise) {
      return this.extractorPromise;
    }

    this.extractorPromise = (async () => {
      try {
        const { env, pipeline } = await dynamicImport("@huggingface/transformers");

        env.allowRemoteModels = true;

        if (EnvVariables.PRODUCT_VECTOR_CACHE_DIR) {
          env.cacheDir = EnvVariables.PRODUCT_VECTOR_CACHE_DIR;
        }

        logger.info(
          {
            model: this.embeddingModel,
            quantized: this.quantized,
            cacheDir: EnvVariables.PRODUCT_VECTOR_CACHE_DIR ?? null,
          },
          "Loading local product embedding model",
        );

        const extractor = await pipeline("feature-extraction", this.embeddingModel, {
          quantized: this.quantized,
        });

        this.extractor = extractor;

        logger.info(
          {
            model: this.embeddingModel,
            quantized: this.quantized,
          },
          "Local product embedding model loaded",
        );

        return extractor;
      } catch (error: any) {
        throw new ApiError(
          500,
          "Failed to initialize local embedding model.",
          error?.message ?? null,
          "product_vector_model_init_failed",
        );
      } finally {
        this.extractorPromise = null;
      }
    })();

    return this.extractorPromise;
  }

  async generateVector(product: Partial<IProduct>, context: ProductVectorContext = {}) {
    try {
      const input = this.buildEmbeddingInput(product, context);
      if (!input) {
        throw new ApiError(
          400,
          "Product does not contain enough data to generate a vector.",
          null,
          "product_vector_input_missing",
        );
      }

      try {
        const extractor = await this.getExtractor();
        const response = await extractor(input, {
          pooling: "mean",
          normalize: true,
        });

        if (!response?.data) {
          throw new Error("Embedding output did not contain vector data.");
        }

        return Array.from(response.data, (value) => Number(value));
      } catch (error: any) {
        if (error instanceof ApiError) {
          throw error;
        }

        throw new ApiError(
          500,
          "Failed to generate product vector.",
          error?.message ?? null,
          "product_vector_generation_failed",
        );
      }
    } catch (error) {
      logger.error(
        {
          error,
          productId: product._id ?? null,
        },
        "Error generating product vector",
      );
      return [-1];
    }
  }
}

export const productVectorService = new ProductVectorService();

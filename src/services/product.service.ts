import mongoose, { Types } from "mongoose";

import { Brand } from "../models/brand.model";
import { Category } from "../models/category.model";
import { IProduct, Product, ProductStatus } from "../models/product.model";
import { productVectorService } from "./product-vector.service";

type ProductDocumentShape = Partial<IProduct> & {
  _id?: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId | string;
  brand?: mongoose.Types.ObjectId | string;
};

const VECTOR_RELEVANT_FIELDS: Array<keyof IProduct> = [
  "name",
  "description",
  "shortDescription",
  "category",
  "brand",
  "productType",
  "variants",
  "features",
  "attributes",
  "tags",
  "metaTitle",
  "metaDescription",
];

export class ProductService {
  private shouldRefreshVector(productData: Partial<IProduct>) {
    return VECTOR_RELEVANT_FIELDS.some((field) => field in productData);
  }

  private normalizeObjectId(value?: mongoose.Types.ObjectId | string) {
    if (!value) {
      return null;
    }

    if (value instanceof Types.ObjectId) {
      return value;
    }

    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }

    return null;
  }

  private async resolveVectorContext(productData: ProductDocumentShape) {
    const categoryId = this.normalizeObjectId(productData.category);
    const brandId = this.normalizeObjectId(productData.brand);

    const [category, brand] = await Promise.all([
      categoryId ? Category.findById(categoryId).select("name").lean() : null,
      brandId ? Brand.findById(brandId).select("name").lean() : null,
    ]);

    return {
      categoryName: category?.name ?? null,
      brandName: brand?.name ?? null,
    };
  }

  private async buildVectorPayload(productData: ProductDocumentShape) {
    const context = await this.resolveVectorContext(productData);
    const vector = await productVectorService.generateVector(productData, context);

    return {
      ...productData,
      vector,
    };
  }

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    const productWithVector = await this.buildVectorPayload(productData);

    return Product.create(productWithVector);
  }

  async updateProduct(
    id: string,
    productData: Partial<IProduct>,
  ): Promise<IProduct | null> {
    const existingProduct = await Product.findById(id).lean<ProductDocumentShape | null>();
    if (!existingProduct) {
      return null;
    }

    const shouldRefreshVector = this.shouldRefreshVector(productData);
    const nextProductData = shouldRefreshVector
      ? {
          ...productData,
          vector: await productVectorService.generateVector(
            {
              ...existingProduct,
              ...productData,
            },
            await this.resolveVectorContext({
              ...existingProduct,
              ...productData,
            }),
          ),
        }
      : productData;

    return Product.findByIdAndUpdate(id, nextProductData, {
      new: true,
      runValidators: true,
    });
  }

  async refreshProductVector(id: string): Promise<IProduct | null> {
    const existingProduct = await Product.findById(id).lean<ProductDocumentShape | null>();
    if (!existingProduct) {
      return null;
    }

    const { vector } = await this.buildVectorPayload(existingProduct);

    return Product.findByIdAndUpdate(
      id,
      { vector },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { status: ProductStatus.INACTIVE },
      { new: true },
    );
  }
}

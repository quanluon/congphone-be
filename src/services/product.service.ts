import { getPagination, getPaginationResponse } from "../utils/pagination";
import { IProduct, Product, ProductStatus } from "../models/product.model";
import { Types } from "mongoose";

export class ProductService {
  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    return Product.create(productData);
  }

  async updateProduct(
    id: string,
    productData: Partial<IProduct>
  ): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, productData, { new: true });
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { status: ProductStatus.INACTIVE },
      { new: true }
    );
  }

  async getProduct(
    id: string,
    status?: ProductStatus
  ): Promise<IProduct | null> {
    const where :any = {
      _id: new Types.ObjectId(id)
    }
    if(status) where.status = status;
    return Product.findOne(
      where,
      {},
      { strictQuery: true, populate: ["category","brand"] }
    );
  }

  async listProducts(options: any) {
    const { search, minPrice, maxPrice, ...rest } = options || {};

    const query: any = {};

    for (const [key, value] of Object.entries(rest)) {
      query[key] = value;
    }

    if (minPrice) query.price = { $gte: minPrice };
    if (maxPrice) query.price = { ...query.price, $lte: maxPrice };
    if (search) query.$text = { $search: search };

    const { skip, limit } = getPagination(options);

    const [products, total] = await Promise.all([
      Product.find(
        query,
        {},
        {
          strictQuery: true,
          sort: {
            createdAt: -1,
          },
          skip,
          limit,
        }
      ),
      Product.countDocuments(query, { strictQuery: true }),
    ]);

    return getPaginationResponse(products, options, total);
  }
}

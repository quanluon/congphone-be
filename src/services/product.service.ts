import { Types } from "mongoose";
import { IProduct, Product, ProductStatus } from "../models/product.model";

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
}

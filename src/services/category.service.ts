import { getPaginationResponse } from "../utils/pagination";
import { Category, ICategory } from "../models/category.model";
import { ApiError } from "../utils/ApiResponse";

export class CategoryService {
  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = new Category(categoryData);
    return await category.save();
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return await Category.findById(id);
  }

  async updateCategory(
    id: string,
    updateData: Partial<ICategory>
  ): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    return await Category.findByIdAndDelete(id);
  }

  async listCategories(query: any = {}) {
    const { search, isActive } = query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    return Category.find(
      filter,
      {},
      { sort: { _id: -1 }, lean: true, strictQuery: true }
    );
  }
}

export const categoryService = new CategoryService();

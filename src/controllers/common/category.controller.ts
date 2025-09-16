import { Request, Response, NextFunction } from "express";
import { Category } from "../../models/category.model";
import { Product } from "../../models/product.model";
import { ApiResponse, ApiError } from "../../utils/ApiResponse";
import { paginate } from "../../utils/pagination";

export class CategoryController {
  // Get all categories
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { sort = "name", order = "asc" } = req.query;

      const sortObj: any = {};
      sortObj[sort as string] = order === "desc" ? -1 : 1;

      const categories = await Category.find({})
        .sort(sortObj)
        .lean();

      const result = {
        data: categories,
        total: categories.length
      };

      res.json(ApiResponse.success(result).build());
    } catch (error) {
      next(error);
    }
  }

  // Get active categories
  async getActiveCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Category.find({ isActive: true })
        .sort({ name: 1 })
        .select("name slug description");

      res.json(ApiResponse.success(categories).build());
    } catch (error) {
      next(error);
    }
  }

  // Get category by ID
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        throw new ApiError(404, 'Category not found', null, 'categoryNotFound');
      }

      res.json(ApiResponse.success(category).build());
    } catch (error) {
      next(error);
    }
  }

  // Get category by slug
  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const category = await Category.findOne({ slug, isActive: true });

      if (!category) {
        throw new ApiError(404, 'Category not found', null, 'categoryNotFound');
      }

      res.json(ApiResponse.success(category).build());
    } catch (error) {
      next(error);
    }
  }

  // Get products in category
  async getCategoryProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
        minPrice,
        maxPrice,
        brand,
        productType,
      } = req.query;

      // Check if category exists
      const category = await Category.findById(id);
      if (!category) {
        throw new ApiError(404, 'Category not found', null, 'categoryNotFound');
      }

      const filter: any = {
        status: "active",
        category: id,
      };

      // Apply additional filters
      if (brand) filter.brand = brand;
      if (productType) filter.productType = productType;

      // Price range filter
      if (minPrice || maxPrice) {
        filter.basePrice = {};
        if (minPrice) filter.basePrice.$gte = Number(minPrice);
        if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
      }

      const sortObj: any = {};
      sortObj[sort as string] = order === "desc" ? -1 : 1;

      const result = await paginate(Product, {
        page: Number(page),
        limit: Number(limit),
        filter,
        sort: sortObj,
        populate: [
          { path: "category", select: "name slug" },
          { path: "brand", select: "name slug logo" },
        ],
      });

      res.json(ApiResponse.success(result).build());
    } catch (error) {
      next(error);
    }
  }
}

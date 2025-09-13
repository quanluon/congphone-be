import { Request, Response, NextFunction } from "express";
import { Brand } from "../../models/brand.model";
import { Product } from "../../models/product.model";
import { ApiResponse, ApiError } from "../../utils/ApiResponse";
import { paginate } from "../../utils/pagination";

export class BrandController {
  // Get all brands
  async getBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, sort = "name", order = "asc" } = req.query;

      const sortObj: any = {};
      sortObj[sort as string] = order === "desc" ? -1 : 1;

      const result = await paginate(Brand, {
        page: Number(page),
        limit: Number(limit),
        sort: sortObj,
      });

      res.json(ApiResponse.success(result).build());
    } catch (error) {
      next(error);
    }
  }

  // Get active brands
  async getActiveBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await Brand.find({ isActive: true })
        .sort({ name: 1 })
        .select("name slug description logo");

      res.json(ApiResponse.success(brands).build());
    } catch (error) {
      next(error);
    }
  }

  // Get brand by ID
  async getBrandById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const brand = await Brand.findById(id);

      if (!brand) {
        throw new ApiError(404, 'Brand not found', null, 'brandNotFound');
      }

      res.json(ApiResponse.success(brand).build());
    } catch (error) {
      next(error);
    }
  }

  // Get brand by slug
  async getBrandBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const brand = await Brand.findOne({ slug, isActive: true });

      if (!brand) {
        throw new ApiError(404, 'Brand not found', null, 'brandNotFound');
      }

      res.json(ApiResponse.success(brand).build());
    } catch (error) {
      next(error);
    }
  }

  // Get products by brand
  async getBrandProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
        minPrice,
        maxPrice,
        category,
        productType,
      } = req.query;

      // Check if brand exists
      const brand = await Brand.findById(id);
      if (!brand) {
        throw new ApiError(404, 'Brand not found', null, 'brandNotFound');
      }

      const filter: any = {
        status: "active",
        brand: id,
      };

      // Apply additional filters
      if (category) filter.category = category;
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

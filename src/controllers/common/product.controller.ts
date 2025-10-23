import { Request, Response, NextFunction } from "express";
import { Product, ProductStatus } from "../../../layers/common/nodejs/models/product.model";
import { ApiResponse, ApiError } from "../../utils/ApiResponse";
import { paginate } from "../../utils/pagination";

export class ProductController {
  // Get all products with pagination and filtering
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
        category,
        brand,
        productType,
        minPrice,
        maxPrice,
        isFeatured,
        isNew,
        status = ProductStatus.ACTIVE,
        search
      } = req.query;

      const filter: any = { status };

      // Apply filters
      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (productType) filter.productType = productType;
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
      if (isNew !== undefined) filter.isNew = isNew === "true";
      if (search) filter.$text = { $search: search as string };

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
        select: "-description", // Exclude description field from response for better performance
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

  // Get featured products
  async getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 8 } = req.query;

      const products = await Product.find({
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      })
        .populate("category", "name slug")
        .populate("brand", "name slug logo")
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      res.json(ApiResponse.success(products).build());
    } catch (error) {
      next(error);
    }
  }

  // Get new products
  async getNewProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 8 } = req.query;

      const products = await Product.find({
        status: ProductStatus.ACTIVE,
        isNew: true,
      })
        .populate("category", "name slug")
        .populate("brand", "name slug logo")
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      res.json(ApiResponse.success(products).build());
    } catch (error) {
      next(error);
    }
  }

  // Get products by category
  async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
        minPrice,
        maxPrice,
      } = req.query;

      const filter: any = {
        status: ProductStatus.ACTIVE,
        category: categoryId,
      };

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
        select: "-description", // Exclude description field from response for better performance
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

  // Get products by brand
  async getProductsByBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { brandId } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
        minPrice,
        maxPrice,
      } = req.query;

      const filter: any = {
        status: ProductStatus.ACTIVE,
        brand: brandId,
      };

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
        select: "-description", // Exclude description field from response for better performance
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

  // Get products by type
  async getProductsByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { productType } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
        minPrice,
        maxPrice,
      } = req.query;

      const filter: any = {
        status: ProductStatus.ACTIVE,
        productType,
      };

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
        select: "-description", // Exclude description field from response for better performance
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

  // Get product by ID
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await Product.findOne({
        _id: id,
        status: ProductStatus.ACTIVE,
      })
        .populate("category", "name slug")
        .populate("brand", "name slug logo");

      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      res.json(ApiResponse.success(product).build());
    } catch (error) {
      next(error);
    }
  }

  // Get product variants
  async getProductVariants(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await Product.findOne({
        _id: id,
        status: ProductStatus.ACTIVE,
      }).select("variants");

      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      // Filter only active variants
      const activeVariants = product.variants.filter(
        (variant) => variant.isActive
      );

      res.json(ApiResponse.success(activeVariants).build());
    } catch (error) {
      next(error);
    }
  }


  // Get related products
  async getRelatedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit = 4 } = req.query;

      // First get the current product
      const currentProduct = await Product.findById(id).select(
        "category brand productType"
      );

      if (!currentProduct) {
        return res.status(404).json(
          ApiResponse.error('Product not found', 404).build()
        );
      }

      // Find related products based on category and product type
      const relatedProducts = await Product.find({
        _id: { $ne: id },
        status: ProductStatus.ACTIVE,
        $or: [
          { category: currentProduct.category },
          { productType: currentProduct.productType },
        ],
      })
        .populate("category", "name slug")
        .populate("brand", "name slug logo")
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      res.json(ApiResponse.success(relatedProducts).build());
    } catch (error) {
      next(error);
    }
  }

  // Get price range for filtering
  async getPriceRange(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, brand, productType } = req.query;

      const filter: any = { status: ProductStatus.ACTIVE };
      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (productType) filter.productType = productType;

      const result = await Product.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$basePrice" },
            maxPrice: { $max: "$basePrice" },
          },
        },
      ]);

      const priceRange = result.length > 0 ? result[0] : { minPrice: 0, maxPrice: 0 };

      res.json(ApiResponse.success(priceRange).build());
    } catch (error) {
      next(error);
    }
  }

  // Get available colors
  async getAvailableColors(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, brand, productType } = req.query;

      const filter: any = { status: ProductStatus.ACTIVE };
      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (productType) filter.productType = productType;

      const result = await Product.aggregate([
        { $match: filter },
        { $unwind: "$variants" },
        { $match: { "variants.isActive": true } },
        {
          $group: {
            _id: "$variants.color",
            colorCode: { $first: "$variants.colorCode" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const colors = result.map((item) => ({
        color: item._id,
        colorCode: item.colorCode,
        count: item.count,
      }));

      res.json(ApiResponse.success(colors).build());
    } catch (error) {
      next(error);
    }
  }

  // Get available storage options
  async getStorageOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, brand, productType } = req.query;

      const filter: any = { status: ProductStatus.ACTIVE };
      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (productType) filter.productType = productType;

      const result = await Product.aggregate([
        { $match: filter },
        { $unwind: "$variants" },
        { $match: { "variants.isActive": true, "variants.storage": { $exists: true } } },
        {
          $group: {
            _id: "$variants.storage",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const storageOptions = result.map((item) => ({
        storage: item._id,
        count: item.count,
      }));

      res.json(ApiResponse.success(storageOptions).build());
    } catch (error) {
      next(error);
    }
  }
}

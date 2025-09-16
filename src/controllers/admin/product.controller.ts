import { NextFunction, Request, Response } from "express";
import { IProductVariant, Product, ProductStatus } from "../../models/product.model";
import { ProductService } from "../../services/product.service";
import { S3Service } from "../../services/s3.service";
import { ApiError, ApiResponse } from "../../utils/ApiResponse";
import { paginate } from "../../utils/pagination";

export class AdminProductController {
  private productService = new ProductService();
  private s3Service = new S3Service();

  // Helper method to process uploaded files and move them to permanent storage
  private async processUploadedFiles(productData: any): Promise<any> {
    const processedData = { ...productData };

    // Process main product images
    if (processedData.images?.length) {
      try {
        const movedImages = await this.s3Service.moveMultipleToPermanent(
          processedData.images,
          'products'
        );
        processedData.images = movedImages.map(img => img.publicUrl);
      } catch (error) {
        console.error('Error moving product images:', error);
        throw new ApiError(500, 'Failed to process product images', null, 'imageProcessingError');
      }
    }

    // Process variant images
    if (processedData.variants?.length) {
      for (let i = 0; i < processedData.variants.length; i++) {
        const variant = processedData.variants[i];
        if (variant.images?.length) {
          try {
            const movedImages = await this.s3Service.moveMultipleToPermanent(
              variant.images,
              'products/variants'
            );
            variant.images = movedImages.map(img => img.publicUrl);
          } catch (error) {
            console.error(`Error moving variant ${i} images:`, error);
            throw new ApiError(500, `Failed to process variant ${i + 1} images`, null, 'variantImageProcessingError');
          }
        }
      }
    }

    return processedData;
  }

  // Get all products for admin (including inactive)
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
        status,
        minPrice,
        maxPrice,
        isFeatured,
        isNew,
        search
      } = req.query;

      const filter: any = {};

      // Apply filters
      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (productType) filter.productType = productType;
      if (status) filter.status = status;
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

  // Get product by ID for admin
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id)
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

  // Create new product
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      let productData = req.body;

      // Process uploaded files and move them to permanent storage
      productData = await this.processUploadedFiles(productData);

      // Calculate base price from variants
      if (productData.variants && productData.variants.length > 0) {
        const prices = productData.variants.map((v: IProductVariant) => v.price);
        productData.basePrice = Math.min(...prices);
      }

      const product = await this.productService.createProduct(productData);

      // Populate the created product
      const populatedProduct = await Product.findById(product._id)
        .populate("category", "name slug")
        .populate("brand", "name slug logo");

      res.status(201).json(ApiResponse.success(populatedProduct).build());
    } catch (error) {
      next(error);
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let updateData = req.body;

      // Process uploaded files and move them to permanent storage
      updateData = await this.processUploadedFiles(updateData);

      // Recalculate base price if variants are updated
      if (updateData.variants?.length) {
        const prices = updateData.variants.map((v: IProductVariant) => v.price);
        updateData.basePrice = Math.min(...prices);
      }

      const product = await this.productService.updateProduct(id, updateData);

      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      // Populate the updated product
      const populatedProduct = await Product.findById(product._id)
        .populate("category", "name slug")
        .populate("brand", "name slug logo");

      res.json(ApiResponse.success(populatedProduct).build());
    } catch (error) {
      next(error);
    }
  }

  // Delete product (soft delete)
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await this.productService.deleteProduct(id);

      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      res.json(ApiResponse.success({ message: 'Product deleted successfully' }).build());
    } catch (error) {
      next(error);
    }
  }

  // Hard delete product
  async hardDeleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      res.json(ApiResponse.success({ message: 'Product permanently deleted' }).build());
    } catch (error) {
      next(error);
    }
  }

  // Bulk update products
  async bulkUpdateProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { productIds, updateData } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new ApiError(400, 'Product IDs array is required', null, 'invalidInput');
      }

      // Use Promise.all for parallel updates as per user preference
      const updatePromises = productIds.map((id: string) => 
        Product.findByIdAndUpdate(id, updateData, { new: true })
      );

      const updatedProducts = await Promise.all(updatePromises);

      res.json(ApiResponse.success({
        message: `${updatedProducts.length} products updated successfully`,
        updatedCount: updatedProducts.length
      }).build());
    } catch (error) {
      next(error);
    }
  }

  // Bulk delete products
  async bulkDeleteProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { productIds } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new ApiError(400, 'Product IDs array is required', null, 'invalidInput');
      }

      // Use Promise.all for parallel updates as per user preference
      const deletePromises = productIds.map((id: string) => 
        Product.findByIdAndUpdate(id, { status: ProductStatus.INACTIVE }, { new: true })
      );

      const deletedProducts = await Promise.all(deletePromises);

      res.json(ApiResponse.success({
        message: `${deletedProducts.length} products deleted successfully`,
        deletedCount: deletedProducts.length
      }).build());
    } catch (error) {
      next(error);
    }
  }

  // Get product statistics
  async getProductStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ["$status", ProductStatus.ACTIVE] }, 1, 0] }
            },
            inactiveProducts: {
              $sum: { $cond: [{ $eq: ["$status", ProductStatus.INACTIVE] }, 1, 0] }
            },
            draftProducts: {
              $sum: { $cond: [{ $eq: ["$status", ProductStatus.DRAFT] }, 1, 0] }
            },
            featuredProducts: {
              $sum: { $cond: ["$isFeatured", 1, 0] }
            },
            newProducts: {
              $sum: { $cond: ["$isNew", 1, 0] }
            },
            averagePrice: { $avg: "$basePrice" },
            minPrice: { $min: "$basePrice" },
            maxPrice: { $max: "$basePrice" }
          }
        }
      ]);

      const productTypeStats = await Product.aggregate([
        {
          $group: {
            _id: "$productType",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const categoryStats = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo"
          }
        },
        { $unwind: "$categoryInfo" },
        {
          $group: {
            _id: "$categoryInfo.name",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const result = {
        overview: stats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          draftProducts: 0,
          featuredProducts: 0,
          newProducts: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0
        },
        byType: productTypeStats,
        byCategory: categoryStats
      };

      res.json(ApiResponse.success(result).build());
    } catch (error) {
      next(error);
    }
  }

  // Update product status
  async updateProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(ProductStatus).includes(status)) {
        throw new ApiError(400, 'Invalid status value', null, 'invalidStatus');
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate("category", "name slug")
       .populate("brand", "name slug logo");

      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      res.json(ApiResponse.success(product).build());
    } catch (error) {
      next(error);
    }
  }

  // Toggle product featured status
  async toggleFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      product.isFeatured = !product.isFeatured;
      await product.save();

      const populatedProduct = await Product.findById(product._id)
        .populate("category", "name slug")
        .populate("brand", "name slug logo");

      res.json(ApiResponse.success(populatedProduct).build());
    } catch (error) {
      next(error);
    }
  }

  // Toggle product new status
  async toggleNew(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      product.isNew = !product.isNew;
      await product.save();

      const populatedProduct = await Product.findById(product._id)
        .populate("category", "name slug")
        .populate("brand", "name slug logo");

      res.json(ApiResponse.success(populatedProduct).build());
    } catch (error) {
      next(error);
    }
  }

  // Get product variants for admin
  async getProductVariants(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id).select("variants");
      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      res.json(ApiResponse.success(product.variants).build());
    } catch (error) {
      next(error);
    }
  }

  // Update product variants
  async updateProductVariants(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { variants } = req.body;

      if (!Array.isArray(variants)) {
        throw new ApiError(400, 'Variants must be an array', null, 'invalidInput');
      }

      const product = await Product.findById(id);
      if (!product) {
        throw new ApiError(404, 'Product not found', null, 'productNotFound');
      }

      // Update variants
      product.variants = variants;

      // Recalculate base price
      if (variants.length > 0) {
        const prices = variants.map((v: IProductVariant) => v.price);
        product.basePrice = Math.min(...prices);
      }

      await product.save();

      const populatedProduct = await Product.findById(product._id)
        .populate("category", "name slug")
        .populate("brand", "name slug logo");

      res.json(ApiResponse.success(populatedProduct).build());
    } catch (error) {
      next(error);
    }
  }
}

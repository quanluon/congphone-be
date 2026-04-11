import { S3Service } from "../../services/s3.service";
import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../../services/category.service";
import { ApiError, ApiResponse } from "../../utils/ApiResponse";

export class AdminCategoryController {
  private categoryService = new CategoryService();
  private s3Service = new S3Service();

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryData = req.body;
      if (categoryData.image) {
        const movedImage = await this.s3Service.moveToPermanent(
          categoryData.image,
          "categories"
        );
        categoryData.image = movedImage.publicUrl;
      }
      const category = await this.categoryService.createCategory(categoryData);

      res
        .status(201)
        .json(
          ApiResponse.success(category, "Category created successfully").build()
        );
    } catch (error: any) {
      if (error.code === 11000) {
        next(
          new ApiError(
            400,
            "Category with this name already exists",
            null,
            "duplicateCategory"
          )
        );
      } else {
        next(error);
      }
    }
  }

  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      if (!category) {
        throw new ApiError(404, "Category not found", null, "categoryNotFound");
      }

      res.json(
        ApiResponse.success(category, "Category retrieved successfully").build()
      );
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.image) {
        const movedImage = await this.s3Service.moveToPermanent(
          updateData.image,
          "categories"
        );
        updateData.image = movedImage.publicUrl;
      }

      const category = await this.categoryService.updateCategory(
        id,
        updateData
      );

      if (!category) {
        throw new ApiError(404, "Category not found", null, "categoryNotFound");
      }

      res.json(
        ApiResponse.success(category, "Category updated successfully").build()
      );
    } catch (error: any) {
      if (error.code === 11000) {
        next(
          new ApiError(
            400,
            "Category with this name already exists",
            null,
            "duplicateCategory"
          )
        );
      } else {
        next(error);
      }
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.deleteCategory(id);

      if (!category) {
        throw new ApiError(404, "Category not found", null, "categoryNotFound");
      }

      res.json(
        ApiResponse.success(null, "Category deleted successfully").build()
      );
    } catch (error) {
      next(error);
    }
  }

  async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const result = await this.categoryService.listCategories(query);

      res.json(
        ApiResponse.success(result, "Categories retrieved successfully").build()
      );
    } catch (error) {
      next(error);
    }
  }
}

export const adminCategoryController = new AdminCategoryController();

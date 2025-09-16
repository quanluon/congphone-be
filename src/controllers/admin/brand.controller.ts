import { Request, Response, NextFunction } from 'express';
import { brandService } from '../../services/brand.service';
import { ApiResponse, ApiError } from '../../utils/ApiResponse';

export class AdminBrandController {
  private brandService = brandService;

  async createBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const brandData = req.body;
      const brand = await this.brandService.createBrand(brandData);
      
      res.status(201).json(ApiResponse.success(brand, 'Brand created successfully').build());
    } catch (error: any) {
      if (error.code === 11000) {
        next(new ApiError(400, 'Brand with this name already exists', null, 'duplicateBrand'));
      } else {
        next(error);
      }
    }
  }

  async getBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const brand = await this.brandService.getBrandById(id);
      
      if (!brand) {
        throw new ApiError(404, 'Brand not found', null, 'brandNotFound');
      }
      
      res.json(ApiResponse.success(brand, 'Brand retrieved successfully').build());
    } catch (error) {
      next(error);
    }
  }

  async updateBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const brand = await this.brandService.updateBrand(id, updateData);
      
      if (!brand) {
        throw new ApiError(404, 'Brand not found', null, 'brandNotFound');
      }
      
      res.json(ApiResponse.success(brand, 'Brand updated successfully').build());
    } catch (error: any) {
      if (error.code === 11000) {
        next(new ApiError(400, 'Brand with this name already exists', null, 'duplicateBrand'));
      } else {
        next(error);
      }
    }
  }

  async deleteBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const brand = await this.brandService.deleteBrand(id);
      
      if (!brand) {
        throw new ApiError(404, 'Brand not found', null, 'brandNotFound');
      }
      
      res.json(ApiResponse.success(null, 'Brand deleted successfully').build());
    } catch (error) {
      next(error);
    }
  }

  async listBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const result = await this.brandService.listBrands(query);
      
      res.json(ApiResponse.success(result, 'Brands retrieved successfully').build());
    } catch (error) {
      next(error);
    }
  }

  async getAllActiveBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await this.brandService.getAllActiveBrands();
      
      res.json(ApiResponse.success(brands, 'Active brands retrieved successfully').build());
    } catch (error) {
      next(error);
    }
  }
}

export const adminBrandController = new AdminBrandController();
